import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type Org = { id: string; name: string; createdAt: string };
type User = { id: string; email: string; fullName: string | null; createdAt: string };
type Member = {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; email: string; fullName: string | null };
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Orgs", "Me", "Members"],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => "/me",
      providesTags: ["Me"],
    }),
    getOrgs: builder.query<Org[], void>({
      query: () => "/orgs",
      providesTags: ["Orgs"],
    }),
    createOrg: builder.mutation<Org, { name: string }>({
      query: (body) => ({ url: "/orgs", method: "POST", body }),
      invalidatesTags: ["Orgs"],
    }),
    updateOrg: builder.mutation<Org, { id: string; name: string }>({
      query: ({ id, name }) => ({ url: `/orgs/${id}`, method: "PATCH", body: { name } }),
      invalidatesTags: ["Orgs"],
    }),
    deleteOrg: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/orgs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Orgs"],
    }),
    getMembers: builder.query<Member[], string>({
      query: (orgId) => `/orgs/${orgId}/members`,
      providesTags: ["Members"],
    }),
    addMember: builder.mutation<Member, { orgId: string; email: string; role: string }>({
      query: ({ orgId, email, role }) => ({
        url: `/orgs/${orgId}/members`,
        method: "POST",
        body: { email, role },
      }),
      invalidatesTags: ["Members"],
    }),
    updateMemberRole: builder.mutation<Member, { orgId: string; userId: string; role: string }>({
      query: ({ orgId, userId, role }) => ({
        url: `/orgs/${orgId}/members/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Members"],
    }),
    removeMember: builder.mutation<{ success: boolean }, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: `/orgs/${orgId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Members"],
    }),
    getStats: builder.query<{
  totalOrgs: number;
  totalUsers: number;
  totalMembers: number;
  recentOrgs: { id: string; name: string; createdAt: string }[];
}, void>({
  query: () => "/stats",
}),
  }),
});

export const {
  useGetMeQuery,
  useGetOrgsQuery,
  useGetStatsQuery,
  useCreateOrgMutation,
  useUpdateOrgMutation,
  useDeleteOrgMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = api;
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type Org = { id: string; name: string; createdAt: string };
type User = { id: string; email: string; fullName: string | null; createdAt: string };

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
  tagTypes: ["Orgs", "Me"],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => "/me",
      providesTags: ["Me"],
    }),
    getOrgs: builder.query<Org[], void>({
      query: () => "/orgs",
      providesTags: ["Orgs"],
    }),
    getUserRole: builder.query<{ role: string | null }, string>({
  query: (orgId) => `/me/role?orgId=${orgId}`,
  providesTags: ["Me"],
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
  }),
});

export const {
  useGetMeQuery,
  useGetOrgsQuery,
  useGetUserRoleQuery,
  useCreateOrgMutation,
  useUpdateOrgMutation,
  useDeleteOrgMutation,
} = api;
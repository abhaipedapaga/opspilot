FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
RUN npm install --save-dev @types/express
COPY . .
RUN DATABASE_URL="postgresql://opspilot:opspilot@db:5432/opspilot" npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
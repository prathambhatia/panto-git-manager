# backend Dockerfile (use Debian-based Node image so Prisma's native engine has the right libs)
FROM node:18-bullseye

WORKDIR /app

# Copy package manifest and install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "--experimental-specifier-resolution=node", "./src/index.js"]

#!/bin/bash
# Habilita el modo para detener el script si ocurre algún error
set -e

# Instalando dependencias en archivo principal
echo "Instalando dependencias en principal..."
npm install

# Instalando dependencias en gateway
echo "Instalando dependencias en gateway..."
cd gateway
npm install
cd ..

# Instalando dependencias en auth
echo "Instalando dependencias en auth..."
cd auth
npm install
cd ..

# Instalando dependencias en courses
echo "Instalando dependencias en courses..."
cd content/courses
npm install
cd ../..

# Instalando dependencias en courses
echo "Instalando dependencias en modules..."
cd content/modules
npm install
cd ../..

# Instalando dependencias en courses
echo "Instalando dependencias en quizzes..."
cd content/quizzes
npm install
cd ../..

# Instalando dependencias en courses
echo "Instalando dependencias en users..."
cd content/users
npm install
cd ../..

# Instalando dependencias en courses
echo "Instalando dependencias en payments..."
cd content/payments
npm install
cd ../..

echo "Instalación de dependencias completada!"

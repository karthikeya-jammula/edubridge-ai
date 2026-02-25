#!/usr/bin/env pwsh
# ============================================
# EduBridge AI – Hackathon Quick Start
# ============================================

Write-Host "🚀 EduBridge AI - Quick Start Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "`n📋 Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "   ✅ .env created (add OPENAI_API_KEY for full AI features)" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma client
Write-Host "`n🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Push schema to database
Write-Host "`n🗃️ Setting up database..." -ForegroundColor Yellow
npx prisma db push

# Seed demo data
Write-Host "`n🌱 Seeding demo data..." -ForegroundColor Yellow
npx ts-node prisma/seed.ts

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`nTo start the app:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host "`nDemo Accounts:" -ForegroundColor White
Write-Host "   Student: student@demo.com / demo123" -ForegroundColor Gray
Write-Host "   Teacher: teacher@demo.com / demo123" -ForegroundColor Gray
Write-Host "   Admin:   admin@demo.com / demo123" -ForegroundColor Gray
Write-Host "`n🌐 Open http://localhost:3000" -ForegroundColor Cyan

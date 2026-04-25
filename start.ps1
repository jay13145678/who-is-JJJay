Write-Host "`n  🚀 启动个人主页服务..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\server"
node index.js

<#
.SYNOPSIS
    DACTYLA STORE APPLIANCE // INSTALADOR PLUG-AND-PLAY 1-CLIQUE PARA COMÉRCIOS (WINDOWS)
    Configura a loja parceira (Oficina, Pet Shop ou Barbearia), extrai os 60 clientes inativos
    para o Teste de Validação de 48h e valida os 3 Playbooks com Spintax e trava de 20 envios/dia.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\dactyla_store_appliance\install_store_agent.ps1 -StoreName "Centro Automotivo Litoral" -Niche "oficina"
#>

param(
    [string]$StoreName = "Centro Automotivo Litoral",
    [ValidateSet("oficina", "petshop", "barbearia")]
    [string]$Niche = "oficina",
    [string]$InputFile = "",
    [switch]$StartDaemon = $false
)

$ErrorActionPreference = "Stop"
$ApplianceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ApplianceDir

Write-Host "================================================================================" -ForegroundColor Yellow
Write-Host " DACTYLA CODE // INSTALADOR PLUG-AND-PLAY DE BALCAO (PROTOCOLO 48H RISCO ZERO)" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Yellow
Write-Host " Loja Parceira : $StoreName" -ForegroundColor Cyan
Write-Host " Subnicho      : $Niche" -ForegroundColor Cyan
Write-Host ""

# 1. Verificação de Runtime (Node.js e Python)
Write-Host "[1/4] Verificando motores Node.js e Python na maquina do comercio..." -ForegroundColor Green
$nodeVer = node -v
$pyVer = python --version
Write-Host "  -> Node.js detectado : $nodeVer"
Write-Host "  -> Python detectado  : $pyVer"

# 2. Gravação do manifesto de configuração local da loja
Write-Host "[2/4] Gravando manifesto local da loja (store_config.json)..." -ForegroundColor Green
$storeConfigPath = Join-Path $ApplianceDir "store_config.json"
$configPayload = @{
    storeName = $StoreName
    niche = $Niche
    dailyLimit = 20
    typingSimulationMs = 4000
    jitterMinSec = 45
    jitterMaxSec = 120
    installedAt = (Get-Date).ToString("o")
} | ConvertTo-Json -Depth 4
Set-Content -Path $storeConfigPath -Value $configPayload -Encoding UTF8

# 3. Extração Universal da Fila de 60 Clientes Inativos
Write-Host "[3/4] Executando Extrator Universal de Clientes Inativos (Lote 60 - Teste 48h)..." -ForegroundColor Green
$extractorScript = Join-Path $ApplianceDir "universal_inactives_extractor.py"
$queueOutput = Join-Path $ApplianceDir "store_inactives_queue.json"

if ($InputFile -and (Test-Path $InputFile)) {
    python $extractorScript --niche $Niche --store "$StoreName" --input "$InputFile" --output "$queueOutput" --limit 60
} else {
    python $extractorScript --niche $Niche --store "$StoreName" --output "$queueOutput" --limit 60
}

# 4. Homologação Dry-Run do Motor de Reativação
Write-Host "[4/4] Validando Motor de Reativacao com Spintax e Trava Anti-Ban..." -ForegroundColor Green
$reactivationEngine = Join-Path $RootDir "dactyla_prospector\client_reactivation_engine.cjs"
node $reactivationEngine --file "$queueOutput" --dry-run

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host " [OK] APPLIANCE INSTALADO E HOMOLOGADO NAS DEPENDENCIAS DO COMERCIO!" -ForegroundColor Green
Write-Host " Para disparar em producao (pareando QR Code no WhatsApp da loja):" -ForegroundColor Yellow
Write-Host "   node .\dactyla_prospector\client_reactivation_engine.cjs --file .\dactyla_store_appliance\store_inactives_queue.json" -ForegroundColor White
Write-Host " Para abrir o Daemon Local do Balcao (:4848):" -ForegroundColor Yellow
Write-Host "   node .\dactyla_store_appliance\store_local_server.cjs" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Green

if ($StartDaemon) {
    node (Join-Path $ApplianceDir "store_local_server.cjs")
}

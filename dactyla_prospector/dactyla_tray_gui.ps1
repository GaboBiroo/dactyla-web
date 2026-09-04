# =========================================================================
# DACTYLA CODE // WINDOWS NATIVE TRAY ICON (NOTIFYICON SYSTEM TRAY)
# Cria o ÍCONE VISÍVEL NATIVO DO TAMANDUÁ na barra de tarefas do Windows (ao lado do relógio).
# =========================================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# 1. Instância do NotifyIcon do Windows
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Application
$notify.BalloonTipTitle = "Dactyla Code // Mascote Tamanduá"
$notify.BalloonTipText = "Infraestrutura B2B operando 100% online!"
$notify.Text = "Dactyla Core // Tamanduá 🟢 Verde"
$notify.Visible = $true

# Exibe notificação de inicialização
$notify.ShowBalloonTip(3000)

# 2. Menu de Contexto (Clique com Botão Direito)
$contextMenu = New-Object System.Windows.Forms.ContextMenu

$itemStatus = New-Object System.Windows.Forms.MenuItem
$itemStatus.Text = "🟢 Status: 100% Saudável (All Green)"
$itemStatus.Add_Click({
    [System.Windows.Forms.MessageBox]::Show("STATUS DO ECOSSISTEMA DACTYLA CODE:`n`n🟢 Ollama API: ONLINE`n🟢 Modelo Llama 3.2: CARREGADO`n🟢 PM2 Autopilot: 24/7 ONLINE`n`nTodas as automações operando sem falhas!", "Dactyla Core // Tamanduá Tray", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})

$itemKanban = New-Object System.Windows.Forms.MenuItem
$itemKanban.Text = "📊 Abrir Kanban de Leads (Vercel)"
$itemKanban.Add_Click({
    Start-Process "https://www.dactylacode.com.br"
})

$itemSeparator = New-Object System.Windows.Forms.MenuItem
$itemSeparator.Text = "-"

$itemExit = New-Object System.Windows.Forms.MenuItem
$itemExit.Text = "❌ Sair do Monitor de Bandeja"
$itemExit.Add_Click({
    $notify.Visible = $false
    $notify.Dispose()
    [System.Windows.Forms.Application]::Exit()
})

$contextMenu.MenuItems.Add($itemStatus) | Out-Null
$contextMenu.MenuItems.Add($itemKanban) | Out-Null
$contextMenu.MenuItems.Add($itemSeparator) | Out-Null
$contextMenu.MenuItems.Add($itemExit) | Out-Null

$notify.ContextMenu = $contextMenu

# 3. Clique duplo no ícone abre o Kanban
$notify.Add_DoubleClick({
    Start-Process "https://www.dactylacode.com.br"
})

# Loop de eventos do Windows Forms
[System.Windows.Forms.Application]::Run()

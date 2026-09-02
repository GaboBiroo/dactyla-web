/**
 * DACTYLA ENGINE // DRIVERLESS WEB THERMAL PRINTER SDK
 * Módulo PWA / Web Browser para Impressão Direta via WebUSB e Web Serial API
 * 
 * Axiomas de Engenharia:
 * 1. Aniquilação total da dependência do Windows Print Spooler e DLLs proprietárias.
 * 2. Emissão de raw bytes hexadecimais ESC/POS diretamente para o endpoint USB (VID/PID) ou porta Serial (COM).
 * 3. Comandos mecânicos embutidos: Corte de papel (GS V 0), abertura de gaveta (ESC p 0 25 250) e alinhamento centralizado.
 */

// Comandos de Fuga ESC/POS Hexadecimais Padrão (Epson / Daruma / Bematech / Elgin)
const ESC_POS = {
  RESET: new Uint8Array([0x1B, 0x40]),                   // ESC @ (Inicializa a impressora)
  ALIGN_LEFT: new Uint8Array([0x1B, 0x61, 0x00]),          // ESC a 0
  ALIGN_CENTER: new Uint8Array([0x1B, 0x61, 0x01]),        // ESC a 1
  ALIGN_RIGHT: new Uint8Array([0x1B, 0x61, 0x02]),         // ESC a 2
  TEXT_BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),        // ESC E 1
  TEXT_BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),       // ESC E 0
  TEXT_DOUBLE_HEIGHT: new Uint8Array([0x1D, 0x21, 0x10]),  // GS ! 16
  TEXT_NORMAL: new Uint8Array([0x1D, 0x21, 0x00]),         // GS ! 0
  CUT_PAPER: new Uint8Array([0x1D, 0x56, 0x41, 0x00]),     // GS V 65 0 (Corte Total/Parcial)
  OPEN_DRAWER: new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]) // ESC p 0 25 250 (Impulso Elétrico Gaveta)
};

export class DactylaWebPrinter {
  constructor() {
    this.usbDevice = null;
    this.serialPort = null;
    this.encoder = new TextEncoder();
  }

  /**
   * Concatena múltiplos Uint8Array em uma única sequência contínua de bytes
   */
  concatBuffers(buffers) {
    const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of buffers) {
      result.set(b, offset);
      offset += b.length;
    }
    return result;
  }

  /**
   * Solicita e conecta-se a uma impressora térmica USB via WebUSB API
   */
  async connectUSB() {
    if (!navigator.usb) {
      throw new Error('WebUSB API não é suportada neste navegador ou ambiente HTTPS não ativo.');
    }

    try {
      this.usbDevice = await navigator.usb.requestDevice({ filters: [] });
      await this.usbDevice.open();
      await this.usbDevice.selectConfiguration(1);
      await this.usbDevice.claimInterface(0);
      console.log(`[Dactyla Engine] Impressora USB Conectada: ${this.usbDevice.productName}`);
      return true;
    } catch (error) {
      console.error('[Dactyla Engine] Erro ao conectar via WebUSB:', error);
      throw error;
    }
  }

  /**
   * Conecta-se a uma impressora térmica via Web Serial API (Porta COM / USB-Serial)
   */
  async connectSerial(baudRate = 9600) {
    if (!navigator.serial) {
      throw new Error('Web Serial API não é suportada neste navegador.');
    }

    try {
      this.serialPort = await navigator.serial.requestPort();
      await this.serialPort.open({ baudRate });
      console.log('[Dactyla Engine] Impressora Serial Conectada com sucesso.');
      return true;
    } catch (error) {
      console.error('[Dactyla Engine] Erro ao conectar via Web Serial:', error);
      throw error;
    }
  }

  /**
   * Monta o buffer de bytes ESC/POS para o Documento Auxiliar DANFE NFC-e
   */
  buildNfceReceiptBuffer(receiptData) {
    const {
      empresa = 'DACTYLA CODE DEMO STORE',
      cnpj = '00.000.000/0001-00',
      itens = [],
      total = 0.0,
      chaveNfce = '3526 0800 0000 0000 0000 6500 1000 0000 0110 0000 0000',
      satOrNfce = 'NFC-e Emissão Autorizada'
    } = receiptData;

    const parts = [];

    // Reset & Cabeçalho Centralizado
    parts.push(ESC_POS.RESET);
    parts.push(ESC_POS.ALIGN_CENTER);
    parts.push(ESC_POS.TEXT_BOLD_ON);
    parts.push(ESC_POS.TEXT_DOUBLE_HEIGHT);
    parts.push(this.encoder.encode(`${empresa}\n`));
    parts.push(ESC_POS.TEXT_NORMAL);
    parts.push(ESC_POS.TEXT_BOLD_OFF);
    parts.push(this.encoder.encode(`CNPJ: ${cnpj}\n`));
    parts.push(this.encoder.encode(`------------------------------------------------\n`));
    parts.push(ESC_POS.TEXT_BOLD_ON);
    parts.push(this.encoder.encode(`DANFE NFC-e - ${satOrNfce}\n`));
    parts.push(ESC_POS.TEXT_BOLD_OFF);
    parts.push(this.encoder.encode(`------------------------------------------------\n`));

    // Alinhamento Esquerdo: Itens da Venda
    parts.push(ESC_POS.ALIGN_LEFT);
    parts.push(this.encoder.encode(`COD  DESCRIÇÃO            QTD   V.UNIT   V.TOTAL\n`));
    
    itens.forEach((item, index) => {
      const lineNum = String(index + 1).padStart(2, '0');
      const desc = item.descricao.padEnd(18, ' ').slice(0, 18);
      const qtd = String(item.qtd).padStart(3, ' ');
      const unit = Number(item.valorUnitario).toFixed(2).padStart(7, ' ');
      const tot = (item.qtd * item.valorUnitario).toFixed(2).padStart(8, ' ');
      parts.push(this.encoder.encode(`${lineNum}  ${desc} ${qtd} x ${unit} = ${tot}\n`));
    });

    parts.push(this.encoder.encode(`------------------------------------------------\n`));
    
    // Totalizador Centralizado em Negrito
    parts.push(ESC_POS.ALIGN_RIGHT);
    parts.push(ESC_POS.TEXT_BOLD_ON);
    parts.push(ESC_POS.TEXT_DOUBLE_HEIGHT);
    parts.push(this.encoder.encode(`TOTAL R$: ${Number(total).toFixed(2)}\n`));
    parts.push(ESC_POS.TEXT_NORMAL);
    parts.push(ESC_POS.TEXT_BOLD_OFF);

    // Rodapé Fiscal & Chave de Acesso
    parts.push(ESC_POS.ALIGN_CENTER);
    parts.push(this.encoder.encode(`\nChave de Acesso:\n${chaveNfce}\n\n`));
    parts.push(this.encoder.encode(`Consulte via QR Code no site da SEFAZ-SP\n`));
    parts.push(this.encoder.encode(`Dactyla Engine Driverless System © 2026\n\n\n`));

    // Comandos Mecânicos: Corte e Gaveta
    parts.push(ESC_POS.OPEN_DRAWER);
    parts.push(ESC_POS.CUT_PAPER);

    return this.concatBuffers(parts);
  }

  /**
   * Envia o buffer compilado para o endpoint do dispositivo conectado
   */
  async printReceipt(receiptData) {
    const rawBuffer = this.buildNfceReceiptBuffer(receiptData);

    if (this.usbDevice && this.usbDevice.opened) {
      // Procura o endpoint de saída (OUT endpoint)
      const endpoint = this.usbDevice.configuration.interfaces[0].alternate.endpoints.find(
        e => e.direction === 'out'
      );
      const endpointNumber = endpoint ? endpoint.endpointNumber : 1;
      await this.usbDevice.transferOut(endpointNumber, rawBuffer);
      console.log('[Dactyla Engine] Impressão enviada com sucesso via WebUSB!');
      return true;
    } else if (this.serialPort && this.serialPort.writable) {
      const writer = this.serialPort.writable.getWriter();
      await writer.write(rawBuffer);
      writer.releaseLock();
      console.log('[Dactyla Engine] Impressão enviada com sucesso via Web Serial!');
      return true;
    } else {
      console.warn('[Dactyla Engine] Dispositivo físico não detectado. Renderizando prévia em console para simulação:');
      console.log(new TextDecoder().decode(rawBuffer));
      return false;
    }
  }
}

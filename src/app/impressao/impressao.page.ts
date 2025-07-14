import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

declare var bluetoothSerial: any;

@Component({
  selector: 'app-impressao',
  templateUrl: './impressao.page.html',
  styleUrls: ['./impressao.page.scss'],
  standalone: false,
})
export class ImpressaoPage implements OnInit {

  // Estado da impressora
  printerConnected = false;
  printerName = '';
  printerMacAddress = '';

  // Tickets para imprimir
  ticketsParaImprimir: any[] = [];
  buscaId = '';

  // Configurações
  incluirQRCode = true;
  incluirCodigoBarras = true;
  corteAutomatico = true;

  // Log de impressões
  logImpressoes: any[] = [];

  // URL da API
  private apiUrl = 'http://localhost/dgprod'; // Altere para seu servidor

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private http: HttpClient,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.verificarBluetoothDisponivel();
      this.carregarTicketsPendentes();
      this.carregarLog();
    });
  }

  ionViewDidEnter() {
    // Verificar se há tickets para imprimir vindos da aba de vendas
    this.carregarTicketsPendentes();
  }

  verificarBluetoothDisponivel() {
    if (typeof bluetoothSerial !== 'undefined') {
      bluetoothSerial.isEnabled(
        () => {
          console.log('Bluetooth está habilitado');
        },
        () => {
          console.log('Bluetooth não está habilitado');
          this.showToast('Bluetooth não está habilitado. Por favor, habilite o Bluetooth.', 'warning');
        }
      );
    } else {
      console.log('Plugin Bluetooth não disponível - modo web');
    }
  }

  carregarTicketsPendentes() {
    // Carregar tickets pendentes do localStorage
    const pedidosParaImprimir = localStorage.getItem('pedidos_para_imprimir');
    const pedidoUnico = localStorage.getItem('pedido_para_imprimir');
    
    if (pedidosParaImprimir) {
      const pedidos = JSON.parse(pedidosParaImprimir);
      this.ticketsParaImprimir = [...this.ticketsParaImprimir, ...pedidos];
      localStorage.removeItem('pedidos_para_imprimir');
    }
    
    if (pedidoUnico) {
      const pedido = JSON.parse(pedidoUnico);
      this.ticketsParaImprimir.push(pedido);
      localStorage.removeItem('pedido_para_imprimir');
    }
  }

  carregarLog() {
    const log = localStorage.getItem('impressao_log');
    if (log) {
      this.logImpressoes = JSON.parse(log);
    }
  }

  salvarLog() {
    localStorage.setItem('impressao_log', JSON.stringify(this.logImpressoes));
  }

  async conectarImpressora() {
    if (typeof bluetoothSerial === 'undefined') {
      await this.showToast('Bluetooth não disponível neste dispositivo', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procurando impressoras...'
    });
    await loading.present();

    try {
      bluetoothSerial.list(
        async (devices: any[]) => {
          loading.dismiss();
          
          if (devices.length === 0) {
            await this.showToast('Nenhuma impressora Bluetooth encontrada', 'warning');
            return;
          }

          // Mostrar lista de dispositivos
          const buttons = devices.map(device => ({
            text: `${device.name} (${device.address})`,
            handler: () => {
              this.conectarDispositivo(device);
            }
          }));

          buttons.push({
            text: 'Cancelar',
            handler: () => {}
          });

          const alert = await this.alertController.create({
            header: 'Selecionar Impressora',
            message: 'Escolha uma impressora para conectar:',
            buttons: buttons
          });

          await alert.present();
        },
        async (error: any) => {
          loading.dismiss();
          console.error('Erro ao listar dispositivos:', error);
          await this.showToast('Erro ao buscar impressoras: ' + error, 'danger');
        }
      );
    } catch (error) {
      loading.dismiss();
      console.error('Erro:', error);
      await this.showToast('Erro ao conectar: ' + error, 'danger');
    }
  }

  async conectarDispositivo(device: any) {
    const loading = await this.loadingController.create({
      message: `Conectando à ${device.name}...`
    });
    await loading.present();

    bluetoothSerial.connect(
      device.address,
      async () => {
        loading.dismiss();
        this.printerConnected = true;
        this.printerName = device.name;
        this.printerMacAddress = device.address;
        await this.showToast(`Conectado à ${device.name}`, 'success');
      },
      async (error: any) => {
        loading.dismiss();
        console.error('Erro ao conectar:', error);
        await this.showToast('Erro ao conectar: ' + error, 'danger');
      }
    );
  }

  async desconectarImpressora() {
    if (typeof bluetoothSerial === 'undefined') return;

    bluetoothSerial.disconnect(
      async () => {
        this.printerConnected = false;
        this.printerName = '';
        this.printerMacAddress = '';
        await this.showToast('Impressora desconectada', 'success');
      },
      async (error: any) => {
        console.error('Erro ao desconectar:', error);
        await this.showToast('Erro ao desconectar: ' + error, 'danger');
      }
    );
  }

  async imprimirTeste() {
    const textoTeste = this.gerarTextoTeste();
    await this.enviarParaImpressora(textoTeste, 'Teste de Impressão');
  }

  gerarTextoTeste(): string {
    return `
        DG PRODUCOES
    ========================
        TESTE DE IMPRESSAO
    ========================
    
    Data: ${new Date().toLocaleString()}
    Impressora: ${this.printerName}
    
    Este eh um teste de impressao
    para verificar se a impressora
    esta funcionando corretamente.
    
    Codigo de barras:
    |||||||| |||| ||||||||
    
    QR Code: [QR]
    
    ========================
    Teste realizado com sucesso!
    ========================
    
    
    
    `;
  }

  async imprimirTicket(ticket: any) {
    const textoTicket = this.gerarTextoTicket(ticket);
    const sucesso = await this.enviarParaImpressora(textoTicket, ticket.cliente_nome);
    
    if (sucesso) {
      // Remover da lista após impressão bem-sucedida
      const index = this.ticketsParaImprimir.findIndex(t => t.id === ticket.id);
      if (index > -1) {
        this.ticketsParaImprimir.splice(index, 1);
      }
    }
  }

  async imprimirTodos() {
    const loading = await this.loadingController.create({
      message: 'Imprimindo todos os ingressos...'
    });
    await loading.present();

    let sucessos = 0;
    let falhas = 0;

    for (const ticket of this.ticketsParaImprimir) {
      const textoTicket = this.gerarTextoTicket(ticket);
      const sucesso = await this.enviarParaImpressora(textoTicket, ticket.cliente_nome, false);
      
      if (sucesso) {
        sucessos++;
      } else {
        falhas++;
      }

      // Pequena pausa entre impressões
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    loading.dismiss();

    if (sucessos > 0) {
      this.ticketsParaImprimir = this.ticketsParaImprimir.slice(sucessos);
    }

    await this.showToast(`${sucessos} impressos com sucesso, ${falhas} falharam`, 
                        falhas === 0 ? 'success' : 'warning');
  }

  gerarTextoTicket(ticket: any): string {
    const data = new Date().toLocaleString();
    
    let texto = `
        DG PRODUCOES
    ========================
         ${ticket.tipo === 'bistro' ? 'RESERVA DE BISTRO' : 'INGRESSO'}
    ========================
    
    Evento: ${ticket.evento_titulo || 'Evento'}
    Data: ${ticket.data_evento || 'Data do evento'}
    Local: ${ticket.local || 'Local do evento'}
    
    Cliente: ${ticket.cliente_nome}
    CPF: ${ticket.cliente_cpf || 'N/A'}
    `;

    if (ticket.tipo === 'bistro') {
      texto += `
    Mesa: ${ticket.numero}
    Mapa: ${ticket.mapa_nome || 'Principal'}
    `;
    } else {
      texto += `
    Tipo: ${ticket.item_nome || 'Ingresso'}
    `;
    }

    texto += `
    Valor: R$ ${Number(ticket.valor).toFixed(2)}
    Pagamento: ${this.formatarFormaPagamento(ticket.forma_pagamento)}
    
    Referencia: ${ticket.referencia}
    `;

    if (this.incluirCodigoBarras) {
      texto += `
    Codigo de Barras:
    |||||||| |||| ||||||||
    ${ticket.referencia}
    `;
    }

    if (this.incluirQRCode) {
      texto += `
    QR Code: [QR-${ticket.referencia}]
    `;
    }

    texto += `
    ========================
    Data impressao: ${data}
    Promoter: ${ticket.vendedor_nome || 'Sistema'}
    
    Apresente este comprovante
    na entrada do evento.
    
    DG Producoes - Todos os
    direitos reservados
    ========================
    
    
    
    `;

    return texto;
  }

  formatarFormaPagamento(forma: string): string {
    const formas: any = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartao de Credito',
      'cartao_debito': 'Cartao de Debito'
    };
    return formas[forma] || forma;
  }

  async enviarParaImpressora(texto: string, clienteNome: string, mostrarToast = true): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof bluetoothSerial === 'undefined') {
        if (mostrarToast) {
          this.showToast('Bluetooth não disponível - simulando impressão', 'warning');
        }
        console.log('SIMULAÇÃO DE IMPRESSÃO:');
        console.log(texto);
        this.adicionarAoLog(clienteNome, true);
        resolve(true);
        return;
      }

      if (!this.printerConnected) {
        if (mostrarToast) {
          this.showToast('Impressora não conectada', 'danger');
        }
        this.adicionarAoLog(clienteNome, false);
        resolve(false);
        return;
      }

      // Comandos ESC/POS
      const init = '\x1B\x40'; // Inicializar impressora
      const centerAlign = '\x1B\x61\x01'; // Centralizar
      const leftAlign = '\x1B\x61\x00'; // Alinhar à esquerda
      const bold = '\x1B\x45\x01'; // Negrito ON
      const boldOff = '\x1B\x45\x00'; // Negrito OFF
      const cut = this.corteAutomatico ? '\x1D\x56\x00' : ''; // Cortar papel
      const feed = '\x1B\x64\x04'; // Avançar papel

      const textoFormatado = init + leftAlign + texto + feed + cut;

      bluetoothSerial.write(
        textoFormatado,
        async () => {
          if (mostrarToast) {
            await this.showToast(`Ingresso de ${clienteNome} impresso!`, 'success');
          }
          this.adicionarAoLog(clienteNome, true);
          resolve(true);
        },
        async (error: any) => {
          console.error('Erro ao imprimir:', error);
          if (mostrarToast) {
            await this.showToast(`Erro ao imprimir ingresso de ${clienteNome}`, 'danger');
          }
          this.adicionarAoLog(clienteNome, false);
          resolve(false);
        }
      );
    });
  }

  adicionarAoLog(clienteNome: string, sucesso: boolean) {
    this.logImpressoes.unshift({
      cliente_nome: clienteNome,
      timestamp: new Date(),
      sucesso: sucesso
    });
    
    // Manter apenas os últimos 50 logs
    if (this.logImpressoes.length > 50) {
      this.logImpressoes = this.logImpressoes.slice(0, 50);
    }
    
    this.salvarLog();
  }

  async buscarIngresso() {
    const loading = await this.loadingController.create({
      message: 'Buscando ingresso...'
    });
    await loading.present();

    try {
      const response = await this.http.get(`${this.apiUrl}/api/buscar-pedido.php?id=${this.buscaId}`).toPromise() as any;
      
      if (response.success) {
        this.ticketsParaImprimir.push(response.pedido);
        await this.showToast('Ingresso encontrado e adicionado à lista', 'success');
        this.buscaId = '';
      } else {
        await this.showToast(response.message || 'Ingresso não encontrado', 'warning');
      }
    } catch (error) {
      console.error('Erro ao buscar ingresso:', error);
      await this.showToast('Erro ao buscar ingresso', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  limparLista() {
    this.ticketsParaImprimir = [];
    this.showToast('Lista de impressão limpa', 'success');
  }

  limparLog() {
    this.logImpressoes = [];
    localStorage.removeItem('impressao_log');
    this.showToast('Log de impressões limpo', 'success');
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

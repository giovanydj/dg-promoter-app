import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vendas',
  templateUrl: './vendas.page.html',
  styleUrls: ['./vendas.page.scss'],
  standalone: false,
})
export class VendasPage implements OnInit {
  
  // Estado de autenticação
  isLoggedIn = false;
  promoterName = '';
  promoterId: number = 0;
  vendasHoje = 0;

  // Dados de login
  loginData = {
    email: '',
    password: ''
  };

  // Dados da venda
  venda = {
    cliente: {
      nome: '',
      cpf: '',
      email: '',
      telefone: ''
    },
    tipo: 'ingresso',
    lote: null as any,
    mesa: null as any,
    quantidade: 1,
    valorTotal: 0,
    formaPagamento: ''
  };

  // Dados dos eventos
  eventos: any[] = [];
  eventoSelecionado: any = null;
  lotes: any[] = [];
  mesas: any[] = [];
  vendasRecentes: any[] = [];

  // URL da API (ajuste conforme seu servidor)
  private apiUrl = 'http://localhost/dgprod'; // Altere para seu servidor

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.verificarLogin();
  }

  async verificarLogin() {
    // Verificar se há dados salvos no localStorage
    const promoterData = localStorage.getItem('promoter_data');
    if (promoterData) {
      const data = JSON.parse(promoterData);
      this.isLoggedIn = true;
      this.promoterName = data.nome;
      this.promoterId = data.id;
      this.carregarEventos();
      this.carregarVendasRecentes();
      this.carregarVendasHoje();
    }
  }

  async login() {
    const loading = await this.loadingController.create({
      message: 'Fazendo login...'
    });
    await loading.present();

    try {
      const response = await this.http.post(`${this.apiUrl}/api/login-promoter.php`, {
        email: this.loginData.email,
        password: this.loginData.password
      }).toPromise() as any;

      if (response.success) {
        this.isLoggedIn = true;
        this.promoterName = response.promoter.nome;
        this.promoterId = response.promoter.id;
        
        // Salvar dados no localStorage
        localStorage.setItem('promoter_data', JSON.stringify(response.promoter));
        
        await this.showToast('Login realizado com sucesso!', 'success');
        this.carregarEventos();
        this.carregarVendasRecentes();
        this.carregarVendasHoje();
      } else {
        await this.showToast(response.message || 'Erro no login', 'danger');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      await this.showToast('Erro de conexão. Verifique sua internet.', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.promoterName = '';
    this.promoterId = 0;
    localStorage.removeItem('promoter_data');
    this.limparFormulario();
  }

  async carregarEventos() {
    try {
      const response = await this.http.get(`${this.apiUrl}/api/eventos-ativos.php`).toPromise() as any;
      if (response.success) {
        this.eventos = response.eventos;
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  }

  async carregarLotes() {
    if (!this.eventoSelecionado) return;

    try {
      const response = await this.http.get(`${this.apiUrl}/api/lotes-evento.php?evento_id=${this.eventoSelecionado.id}`).toPromise() as any;
      if (response.success) {
        this.lotes = response.lotes;
      }

      const responseMesas = await this.http.get(`${this.apiUrl}/api/mesas-evento.php?evento_id=${this.eventoSelecionado.id}`).toPromise() as any;
      if (responseMesas.success) {
        this.mesas = responseMesas.mesas;
      }
    } catch (error) {
      console.error('Erro ao carregar lotes/mesas:', error);
    }
  }

  async carregarVendasRecentes() {
    try {
      const response = await this.http.get(`${this.apiUrl}/api/vendas-recentes.php?promoter_id=${this.promoterId}`).toPromise() as any;
      if (response.success) {
        this.vendasRecentes = response.vendas;
      }
    } catch (error) {
      console.error('Erro ao carregar vendas recentes:', error);
    }
  }

  async carregarVendasHoje() {
    try {
      const response = await this.http.get(`${this.apiUrl}/api/vendas-hoje.php?promoter_id=${this.promoterId}`).toPromise() as any;
      if (response.success) {
        this.vendasHoje = response.total;
      }
    } catch (error) {
      console.error('Erro ao carregar vendas de hoje:', error);
    }
  }

  onTipoChange() {
    this.venda.lote = null;
    this.venda.mesa = null;
    this.calcularTotal();
  }

  calcularTotal() {
    let valorUnitario = 0;
    
    if (this.venda.tipo === 'ingresso' && this.venda.lote) {
      valorUnitario = this.venda.lote.preco;
    } else if (this.venda.tipo === 'bistro' && this.venda.mesa) {
      valorUnitario = this.venda.mesa.preco;
    }

    this.venda.valorTotal = valorUnitario * this.venda.quantidade;
  }

  isVendaValida(): boolean {
    return !!(
      this.venda.cliente.nome &&
      this.venda.cliente.cpf &&
      this.venda.formaPagamento &&
      this.venda.quantidade > 0 &&
      this.venda.valorTotal > 0 &&
      ((this.venda.tipo === 'ingresso' && this.venda.lote) ||
       (this.venda.tipo === 'bistro' && this.venda.mesa))
    );
  }

  async processarVenda() {
    const loading = await this.loadingController.create({
      message: 'Processando venda...'
    });
    await loading.present();

    try {
      const vendaData = {
        cliente: this.venda.cliente,
        tipo: this.venda.tipo,
        item_id: this.venda.tipo === 'ingresso' ? this.venda.lote.id : this.venda.mesa.id,
        quantidade: this.venda.quantidade,
        valor: this.venda.valorTotal / this.venda.quantidade,
        valor_total: this.venda.valorTotal,
        forma_pagamento: this.venda.formaPagamento,
        promoter_id: this.promoterId,
        evento_id: this.eventoSelecionado.id
      };

      const response = await this.http.post(`${this.apiUrl}/api/processar-venda.php`, vendaData).toPromise() as any;

      if (response.success) {
        await this.showToast('Venda realizada com sucesso!', 'success');
        
        // Perguntar se quer imprimir
        const alert = await this.alertController.create({
          header: 'Venda Realizada',
          message: 'Deseja imprimir o(s) ingresso(s) agora?',
          buttons: [
            {
              text: 'Não',
              role: 'cancel',
              handler: () => {
                this.limparFormulario();
                this.carregarVendasRecentes();
                this.carregarVendasHoje();
              }
            },
            {
              text: 'Sim',
              handler: () => {
                this.irParaImpressao(response.pedidos);
              }
            }
          ]
        });
        await alert.present();

      } else {
        await this.showToast(response.message || 'Erro ao processar venda', 'danger');
      }
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      await this.showToast('Erro de conexão. Tente novamente.', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  irParaImpressao(pedidos: any[]) {
    // Navegar para aba de impressão com os dados
    // Implementar navegação entre abas
    localStorage.setItem('pedidos_para_imprimir', JSON.stringify(pedidos));
    // Trocar para aba de impressão (implementar depois)
  }

  async imprimirVenda(venda: any) {
    localStorage.setItem('pedido_para_imprimir', JSON.stringify(venda));
    // Navegar para aba de impressão
  }

  limparFormulario() {
    this.venda = {
      cliente: {
        nome: '',
        cpf: '',
        email: '',
        telefone: ''
      },
      tipo: 'ingresso',
      lote: null,
      mesa: null,
      quantidade: 1,
      valorTotal: 0,
      formaPagamento: ''
    };
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

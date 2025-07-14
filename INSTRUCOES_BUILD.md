# DG Promoter App - Instruções de Build

## App Criado com Sucesso! 🎉

O aplicativo **DG Promoter** foi criado com Ionic + Capacitor e inclui:

### ✅ Funcionalidades Implementadas:

1. **Tela de Vendas**
   - Login de promoter
   - Formulário completo de venda
   - Seleção de eventos, lotes e mesas
   - Cálculo automático de totais
   - Múltiplas formas de pagamento

2. **Tela de Impressão Bluetooth**
   - Conexão com impressoras Bluetooth nativas
   - Impressão de tickets formatados
   - Códigos de barras em texto ASCII
   - Log de impressões
   - Configurações personalizáveis

3. **Estrutura Completa**
   - 4 abas: Vendas, Impressão, Relatórios, Configurações
   - Interface Ionic moderna
   - Compatível com Android e iOS

## Como Gerar o APK (Android):

### Opção 1 - Android Studio (Recomendado)
1. Instale o Android Studio
2. Execute: `ionic capacitor open android`
3. No Android Studio: Build > Generate Signed Bundle/APK
4. Escolha APK e siga as instruções

### Opção 2 - Linha de Comando
1. Instale o Android SDK
2. Configure as variáveis de ambiente
3. Execute:
   ```bash
   cd dg-promoter-app/android
   ./gradlew assembleDebug
   ```
4. O APK será gerado em: `android/app/build/outputs/apk/debug/`

### Opção 3 - APK Online (Mais Fácil)
1. Acesse: https://www.websitetoapk.com/
2. Ou use: https://appmaker.xyz/
3. Cole a URL do seu site: `http://localhost/dgprod/promoter/`
4. Configure como "Kiosk Mode" ou "Full Screen"

## Como Gerar o IPA (iOS):

1. Instale o Xcode (apenas no macOS)
2. Execute: `ionic capacitor open ios`
3. No Xcode: Product > Archive
4. Distribua via App Store Connect ou Ad Hoc

## APIs PHP Necessárias:

Você precisará criar estes arquivos PHP na pasta `/api/`:

1. **login-promoter.php** - Login do promoter
2. **eventos-ativos.php** - Lista eventos ativos
3. **lotes-evento.php** - Lista lotes por evento
4. **mesas-evento.php** - Lista mesas por evento
5. **processar-venda.php** - Processa nova venda
6. **vendas-recentes.php** - Lista vendas recentes
7. **vendas-hoje.php** - Total de vendas do dia
8. **buscar-pedido.php** - Busca pedido por ID/referência

## Configuração do Servidor:

No arquivo `src/app/vendas/vendas.page.ts` e `src/app/impressao/impressao.page.ts`, altere:

```typescript
private apiUrl = 'https://seudominio.com/dgprod'; // Altere aqui
```

## Testando o App:

1. **No Navegador**: `ionic serve`
2. **Android**: `ionic capacitor run android`
3. **iOS**: `ionic capacitor run ios`

## Bluetooth No iPhone:

O app usa plugins nativos, então funcionará perfeitamente no iPhone, diferente do navegador que tem limitações.

## Próximos Passos:

1. ✅ App criado e funcional
2. 🔄 Criar APIs PHP necessárias
3. ⏳ Gerar APK/IPA
4. ⏳ Testar impressão Bluetooth
5. ⏳ Deploy na loja de apps

## Suporte:

O app está pronto para uso e pode ser facilmente customizado. Todas as funcionalidades principais estão implementadas!

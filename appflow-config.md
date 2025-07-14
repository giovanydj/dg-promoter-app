# Configuração Ionic Appflow

## 📱 Planos Disponíveis:

### **Starter (Grátis):**
- ❌ Sem builds nativas
- ✅ Live updates
- ✅ Deploy web

### **Launch ($29/mês):**
- ✅ **Builds iOS/Android** ⭐
- ✅ 1000 builds/mês
- ✅ Certificados automatizados
- ✅ Live updates

### **Growth ($99/mês):**
- ✅ Builds ilimitados
- ✅ Automação CI/CD
- ✅ Múltiplos apps

## 🚀 Processo de Build iOS:

1. **Upload do código** para Appflow
2. **Configure certificados:**
   - Provisioning Profile
   - Certificate (.p12)
   - App ID
3. **Start build** - demora ~15-20min
4. **Download .ipa** pronto para App Store

## 📋 Requisitos para iOS:

### **Apple Developer Account ($99/ano):**
- Criar em: https://developer.apple.com/
- Necessário para gerar certificados
- Obrigatório para publicar na App Store

### **Certificados necessários:**
1. **Development Certificate** (para testes)
2. **Distribution Certificate** (para App Store)
3. **Provisioning Profile**
4. **App ID único** (ex: com.dgproducoes.promoter)

## 🔧 Como configurar:

### **1. No Appflow Dashboard:**
- Project Settings → Certificates
- Upload certificados iOS
- Configure Bundle ID

### **2. Iniciar Build:**
- Builds → Start build
- Platform: iOS
- Build Type: App Store / Ad Hoc
- Target Platform: iOS
- Click "Start build"

### **3. Download:**
- Aguardar build (15-20min)
- Download .ipa
- Instalar via TestFlight ou Xcode

## 💡 Alternativas mais baratas:

### **Codemagic (Competidor):**
- 500 min grátis/mês
- $95/mês depois
- Similar ao Appflow

### **GitHub Actions + fastlane:**
- Setup complexo
- Mais barato
- Precisa configurar tudo manualmente

## 🎯 Recomendação:

1. **Teste o plano Launch ($29) por 1 mês**
2. **Configure certificados iOS**
3. **Gere o .ipa**
4. **Publique na App Store**

Quer que eu te ajude a configurar o Apple Developer Account primeiro?

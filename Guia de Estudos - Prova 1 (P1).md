# Guia de Estudos: Programação para Dispositivos Móveis (P1)

Material compilado a partir das aulas teóricas, práticas e do plano de ensino da disciplina ministrada pelo Prof. Alan Felipe (IESB - 2026.2). Este roteiro cobre todo o conteúdo avaliado na Prova 1 (P1).

---

## 1. Fundamentos do Desenvolvimento Mobile (Aula 01)

### O que define um dispositivo móvel
Dispositivos móveis são equipamentos portáteis projetados para executar aplicações, comunicar-se por redes sem fio e acompanhar as pessoas no dia a dia. Além de smartphones e tablets, essa categoria inclui smartwatches, coletores de dados de armazém e módulos automotivos.

Suas características técnicas principais incluem:
- Mobilidade contínua e restrições de consumo energético (bateria).
- Variedade de conexões: Wi-Fi, 4G/5G, Bluetooth, NFC.
- Conjunto amplo de sensores integrados: GPS, acelerômetro, giroscópio, biometria e câmeras.

### Fragmentação no Ecossistema
A fragmentação é o desafio de fazer um mesmo aplicativo funcionar em milhares de aparelhos diferentes. Ela se divide em três níveis:
1. Sistemas Operacionais: Android (Google, código aberto) e iOS (Apple, ecossistema fechado).
2. Hardware: Diferenças no processador, quantidade de memória RAM e densidade de pixels.
3. Versões ativas: Aparelhos antigos continuam no mercado com versões desatualizadas do sistema, obrigando a equipe técnica a manter compatibilidade retroativa.

### Abordagens de Desenvolvimento

| Abordagem | Tecnologias Principais | Vantagens | Desvantagens |
| :--- | :--- | :--- | :--- |
| **Nativa** | Kotlin/Java (Android), Swift/Objective-C (iOS) | Acesso irrestrito ao hardware e desempenho máximo. | Exige duas bases de código separadas, aumentando custo e tempo de manutenção. |
| **Híbrida** | HTML, CSS, JavaScript empacotados em WebViews (Ionic, Apache Cordova, Capacitor) | Aproveita conhecimento de desenvolvimento web; um código roda em várias plataformas. | Queda de rendimento visual, transições menos fluidas e limitações no acesso a recursos de baixo nível. |
| **Multiplataforma** | React Native (JS/TS), Flutter (Dart) | Base de código única com interface renderizada nativamente; produtividade alta. | Bibliotecas de terceiros podem demorar a suportar novas versões de SO; módulos muito específicos exigem escrita de pontes nativas. |

### Links de Apoio
- [Documentação Oficial: React Native - Core Concepts](https://reactnative.dev/docs/getting-started)
- [Android Developers: Fundamentos do Desenvolvimento de Aplicativos](https://developer.android.com/guide)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Vídeo de Apoio: Nativo vs Híbrido vs Multiplataforma](https://www.youtube.com/results?search_query=nativo+vs+hibrido+vs+multiplataforma+programacao+mobile)

---

## 2. Ecossistema React Native, Nova Arquitetura e Expo (Aula 02)

### Como o React Native Funciona
Diferente de aplicações híbridas em WebView, o React Native utiliza JavaScript para controlar componentes reais da plataforma. Quando você escreve `<View>`, o framework instrui o sistema operacional a criar uma `android.view.View` no Android ou uma `UIView` no iOS.

A arquitetura tradicional dependia de uma ponte (bridge) assíncrona baseada em JSON para comunicação entre o código JavaScript e o código nativo. A Nova Arquitetura substituiu a bridge pela **JSI (JavaScript Interface)**:
- Comunicação direta via referências em C++, sem serialização de strings JSON.
- **Fabric:** Novo motor de renderização síncrona que reduz atrasos visuais na tela.
- **TurboModules:** Carregamento sob demanda de módulos nativos (sensores, câmera), economizando memória de inicialização.

### Por que usar o Expo
O Expo é a ferramenta recomendada pela documentação oficial do React Native. Ele funciona como uma camada de abstração que acelera o fluxo de trabalho:
- **Managed Workflow:** O Expo gerencia pastas nativas (`android` e `ios`), dispensando o uso do Android Studio ou Xcode durante a fase de desenvolvimento com código JavaScript/TypeScript.
- **Expo Go:** Aplicativo instalado no celular físico para testar o projeto via leitura de QR Code na mesma rede local.
- **Expo Router:** Sistema de rotas baseado na árvore de arquivos da pasta `app/`, espelhando a convenção do Next.js.
- **Módulos Prontos:** Pacotes mantidos e testados para câmera, acelerômetro, armazenamento e permissões.

### React Web versus React Native

| Recurso | React Web | React Native |
| :--- | :--- | :--- |
| **Contêiner base** | `<div>`, `<section>` | `<View>` |
| **Exibição de texto** | `<p>`, `<span>`, `<h1>` | `<Text>` (obrigatório para qualquer string na tela) |
| **Entrada de dados** | `<input type="text">` | `<TextInput>` |
| **Rolagem de tela** | Rolagem automática no navegador | `<ScrollView>` ou `<FlatList>` (exigem declaração explícita) |
| **Estilização** | Folhas de estilo CSS, seletores de classe | Objetos JavaScript via `StyleSheet.create` |

### Comandos de Inicialização
```bash
# Conferir ferramentas instaladas no terminal
node -v
npm -v
git --version

# Criar projeto com a estrutura moderna do Expo
npx create-expo-app@latest meu-projeto-mobile

# Acessar a pasta e abrir no editor
cd meu-projeto-mobile
code .

# Iniciar o servidor de desenvolvimento
npx expo start
```

### Links de Apoio
- [Guia Oficial: Getting Started com Expo](https://docs.expo.dev/get-started/create-a-project/)
- [Documentação Oficial: The New React Native Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Vídeo de Apoio: Setup do Expo e Primeiros Passos no VS Code](https://www.youtube.com/results?search_query=expo+react+native+iniciante+setup)

---

## 3. Estrutura de Projetos, Metro Bundler e Dependências (Aula 03)

### Mapeamento dos Arquivos do Projeto
Na convenção moderna com Expo Router, o projeto fica organizado da seguinte forma:
- `app/`: Contém as páginas e rotas. O arquivo `app/index.tsx` representa a rota principal (`/`). Subpastas como `app/(tabs)/` agrupam rotas com barra de navegação inferior.
- `app/_layout.tsx`: Define cabeçalhos, barras de navegação persistentes e provedores compartilhados pelas telas.
- `components/`: Pasta dedicada a componentes reutilizáveis (botões, campos, cartões).
- `assets/`: Arquivos estáticos como ícones, logos e fontes personalizadas.
- `package.json`: Relação de dependências instaladas e scripts operacionais.
- `app.json`: Configuração de metadados do aplicativo (nome de exibição, ícone da tela inicial, orientação padrão).
- `.env`: Arquivo para chaves de API e variáveis de ambiente privadas.

### O Ciclo do Metro Bundler
Quando você roda `npx expo start`, o Expo CLI delega o empacotamento do código ao **Metro Bundler**. O Metro realiza as seguintes etapas:
1. Resolve as árvores de importação a partir dos arquivos de entrada.
2. Transpila TypeScript e JSX em código JavaScript executável pelo motor do dispositivo (Hermes).
3. Envia o pacote gerado via HTTP/WebSocket para o aplicativo Expo Go no celular.

### Tipos de Atualização de Código em Desenvolvimento
Durante os testes no emulador ou aparelho físico, três mecanismos históricos definem como as alterações aparecem:
- **Live Reload:** Recarrega a aplicação inteira do zero ao salvar o arquivo. Limpa todo o estado da tela.
- **Hot Reload:** Substituía apenas os módulos alterados em tempo de execução, mas frequentemente deixava o estado do React inconsistente.
- **Fast Refresh:** Padrão atual do React Native. Aplica as mudanças de forma imediata e preserva os valores já digitados ou selecionados no estado do componente.

### Instalação de Bibliotecas Externas
No ambiente Expo, instale pacotes sempre através do comando `npx expo install`. Esse utilitário seleciona a versão homologada para a versão do Expo SDK em uso.

Exemplo de uso com formatação de datas:
```bash
npx expo install date-fns
```

Consumo no componente:
```tsx
import { Text, View, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TelaHistorico() {
  const dataFormatada = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", {
    locale: ptBR,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Registro atualizado em: {dataFormatada}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  texto: { fontSize: 16, color: '#333' },
});
```

### Links de Apoio
- [Documentação Oficial: Expo Router Introduction](https://docs.expo.dev/router/introduction/)
- [Documentação Oficial: Fast Refresh no React Native](https://reactnative.dev/docs/fast-refresh)
- [Documentação: Date-fns Getting Started](https://date-fns.org/docs/Getting-Started)

---

## 4. JSX e Componentização na Prática (Aula 04)

### Conceitos Centrais
Um componente é um bloco autônomo que encapsula estrutura visual e comportamento.
- **Componentes Funcionais:** Funções puras em JavaScript/TypeScript que recebem propriedades e retornam JSX. Utilizam Hooks (`useState`, `useEffect`) para controlar estado e efeitos colaterais. São o padrão oficial.
- **Componentes de Classe:** Sintaxe mais antiga com `class MeuComponente extends React.Component` e métodos como `render()`.

### Decomposição de Telas Monolíticas
A divisão de telas extensas em componentes menores melhora a legibilidade e permite reutilizar pedaços de interface em múltiplos lugares do aplicativo.

Exemplo de divisão de uma tela de cadastro:

#### 1. Cabeçalho (`components/HeaderCadastro.tsx`)
```tsx
import { View, Text, StyleSheet } from 'react-native';

export function HeaderCadastro() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar Nova Conta</Text>
      <Text style={styles.subtitulo}>Informe seus dados para continuar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  subtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
});
```

#### 2. Campo de Entrada Reutilizável (`components/CampoEntrada.tsx`)
```tsx
import { View, Text, TextInput, StyleSheet } from 'react-native';

type CampoProps = {
  rotulo: string;
  placeholder: string;
  seguro?: boolean;
};

export function CampoEntrada({ rotulo, placeholder, seguro = false }: CampoProps) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={seguro}
        style={styles.input}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: 16 },
  rotulo: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
});
```

#### 3. Montagem da Rota (`app/cadastro.tsx`)
```tsx
import { View, StyleSheet, Button } from 'react-native';
import { HeaderCadastro } from '@/components/HeaderCadastro';
import { CampoEntrada } from '@/components/CampoEntrada';

export default function TelaCadastro() {
  return (
    <View style={styles.tela}>
      <HeaderCadastro />
      <CampoEntrada rotulo="Nome Completo" placeholder="Ex: Maria da Silva" />
      <CampoEntrada rotulo="E-mail" placeholder="email@dominio.com" />
      <CampoEntrada rotulo="Senha" placeholder="Digite sua senha" seguro />
      <Button title="Cadastrar Usuário" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
});
```

### Links de Apoio
- [Documentação Oficial do React: Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [Artigo de Arquitetura: Atomic Design no Desenvolvimento de Interfaces](https://bradfrost.com/blog/post/atomic-web-design/)

---

## 5. Estilização com StyleSheet e Layout com Flexbox (Aula 05)

### Como funciona o StyleSheet.create
Em vez de passar objetos literais diretamente na propriedade `style={{ ... }}`, a prática padrão é utilizar `StyleSheet.create()`. Esse método valida chaves de estilo, organiza referências estáticas e melhora a clareza do código.

```tsx
import { StyleSheet, View, Text } from 'react-native';

export function Cartao() {
  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Cartão de Boas-Vindas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
```

### Propriedades de Estilo Essenciais
- **Espaçamento:** `padding`, `paddingHorizontal`, `paddingVertical`, `margin`, `marginHorizontal`, `marginVertical`, `gap`.
- **Cores e Bordas:** `backgroundColor`, `borderWidth`, `borderColor`, `borderRadius`.
- **Texto:** `fontSize`, `fontWeight` ('bold', 'normal', '600'), `color`, `textAlign` ('center', 'left', 'right').
- **Posicionamento:** `position: 'relative' | 'absolute'`, `top`, `bottom`, `left`, `right`.

### Mecânica do Flexbox no Mobile
O Flexbox no React Native possui duas particularidades em relação à Web:
1. **`flexDirection` padrão é `'column'`**: Os componentes filhos se organizam verticalmente (um abaixo do outro). Na Web o padrão é horizontal (`row`).
2. **Valores numéricos diretos:** Não se utiliza a unidade `px`. Os números representam pixels lógicos independentes de densidade (dp no Android, pontos no iOS).

#### Alinhamento no Eixo Principal (`justifyContent`)
Controla como os itens se distribuem ao longo da direção do contêiner:
- `'flex-start'`: Agrupa itens no início.
- `'center'`: Centraliza os itens.
- `'flex-end'`: Agrupa itens no final.
- `'space-between'`: Espaço uniforme entre os itens, com o primeiro e último colados nas bordas.
- `'space-around'`: Espaço distribuído ao redor de cada elemento.
- `'space-evenly'`: Espaçamento idêntico entre os itens e também nas extremidades.

#### Alinhamento no Eixo Transversal (`alignItems`)
Controla o posicionamento no eixo perpendicular:
- `'stretch'`: Estica os filhos para preencher a largura total (quando não possuem largura fixa).
- `'flex-start'`: Alinha no início do eixo cruzado.
- `'center'`: Centraliza no eixo cruzado.
- `'flex-end'`: Alinha no fim do eixo cruzado.

#### Proporção com `flex`
A propriedade `flex: N` distribui o espaço restante do contêiner pai entre os filhos:
- Dois elementos com `flex: 1` ocupam metade do espaço cada (50% / 50%).
- Um elemento com `flex: 1` e outro com `flex: 2`: o primeiro ocupa um terço do espaço (33,3%) e o segundo ocupa dois terços (66,7%).

### Links de Apoio
- [Guia Oficial do React Native: Layout with Flexbox](https://reactnative.dev/docs/flexbox)
- [Yoga Layout Playground (Testador interativo do motor de layout)](https://yogalayout.dev/playground)
- [Vídeo de Apoio: Flexbox no React Native Explicado](https://www.youtube.com/results?search_query=flexbox+react+native+guia)

---

## 6. Responsividade e Breakpoints (Aula 06)

### Estratégia de Adaptação de Telas
Em aplicações para celulares e tablets, a interface precisa acomodar diferentes resoluções e orientações (retrato e paisagem). As principais alterações práticas envolvem:
- Alternar a direção do layout: coluna única em telas pequenas e linhas ou colunas duplas em telas maiores.
- Redimensionar espaçamentos: paddings menores em smartphones (16) e maiores em tablets (32).
- Quebra de linha fluida: aplicação da regra `flexWrap: 'wrap'` para que cartões ocupem a linha de baixo conforme o espaço disponível acaba.

### O Hook `useWindowDimensions`
O Hook nativo `useWindowDimensions()` entrega as medidas atuais da janela e recalcula a renderização se o usuário girar o aparelho:

```tsx
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

export function CatalogoResponsivo() {
  const { width } = useWindowDimensions();

  // Limite comum para tablet
  const isTablet = width >= 768;

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <View style={[styles.card, isTablet && styles.cardTablet]}>
        <Text style={styles.titulo}>Item 1</Text>
      </View>
      <View style={[styles.card, isTablet && styles.cardTablet]}>
        <Text style={styles.titulo}>Item 2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
  containerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 32,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardTablet: {
    flex: 1,
    minWidth: 280,
    marginBottom: 0,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### Links de Apoio
- [Documentação Oficial: useWindowDimensions API](https://reactnative.dev/docs/usewindowdimensions)
- [Fórum Stack Overflow: Discussões sobre Responsividade em React Native](https://stackoverflow.com/questions/tagged/react-native-responsive)

---

## 7. Props e State (Aula 08)

### Comparativo Definitivo

| Característica | Props (Propriedades) | State (Estado) |
| :--- | :--- | :--- |
| **Origem** | Fornecidas pelo componente pai de fora para dentro | Declarado e controlado dentro do próprio componente |
| **Mutabilidade** | Imutáveis (leitura estrita para o componente que recebe) | Mutável ao longo do tempo através da função atualizadora |
| **Finalidade** | Configurar e parametrizar o componente | Armazenar dados dinâmicos resultantes de interações |
| **Re-render** | Não disparam renderização própria (só se o pai mudar o valor) | Toda atualização no estado agenda um re-render na tela |

### O Hook `useState`
O estado guarda as informações que mudam durante o uso da tela:

```tsx
import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export function ContadorCliques() {
  const [contagem, setContagem] = useState(0);

  function incrementar() {
    setContagem(contagem + 1);
  }

  return (
    <View style={styles.box}>
      <Text style={styles.rotulo}>Cliques efetuados: {contagem}</Text>
      <Button title="Incrementar" onPress={incrementar} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 20, alignItems: 'center' },
  rotulo: { fontSize: 18, marginBottom: 12 },
});
```

### Regra de Ouro: Imutabilidade
Nunca atribua valores diretamente a uma variável de estado:
```tsx
// ERRADO: O motor do React não detecta a mudança e nada acontece na tela
contagem = contagem + 1;

// CORRETO: Chama a função despachante fornecida pelo Hook
setContagem(contagem + 1);
```

### Fluxo Unidirecional e Elevação de Estado (Lifting State Up)
No React, os dados trafegam exclusivamente de cima para baixo (do componente pai para os componentes filhos).

Se dois componentes irmãos precisam compartilhar a mesma informação, o estado deve ser transferido para o ancestral comum mais próximo:
1. O pai mantém a variável no `useState`.
2. O pai desce o valor atual para os filhos via props normais.
3. O pai desce funções modificadoras (callbacks) para que os filhos avisem quando um novo valor for inserido.

```tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

// Filho 1: Campo de digitação
function EntradaValor({ valor, aoDigitar }: { valor: string; aoDigitar: (v: string) => void }) {
  return (
    <TextInput
      value={valor}
      onChangeText={aoDigitar}
      keyboardType="numeric"
      style={styles.input}
      placeholder="Digite um número"
    />
  );
}

// Filho 2: Painel de leitura
function PainelDobro({ numero }: { numero: number }) {
  return <Text style={styles.resultado}>O dobro é: {isNaN(numero) ? 0 : numero * 2}</Text>;
}

// Pai: Guarda o dado centralizado
export function CalculadoraSimples() {
  const [texto, setTexto] = useState('0');

  return (
    <View style={styles.container}>
      <EntradaValor valor={texto} aoDigitar={setTexto} />
      <PainelDobro numero={parseFloat(texto)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 8, borderRadius: 6, marginBottom: 10 },
  resultado: { fontSize: 16, fontWeight: 'bold' },
});
```

### Links de Apoio
- [Documentação Oficial do React: useState Hook Reference](https://react.dev/reference/react/useState)
- [Guia Oficial do React: Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Vídeo de Apoio: Entendendo Props e State no React Native](https://www.youtube.com/results?search_query=useState+props+react+native+iniciante)

---

## 8. Manipulação de Eventos e Componentes Interativos (Aula 09)

### Paradigma Declarativo
No React Native, os eventos físicos do usuário (tocar, digitar, rolar) executam manipuladores que alteram o estado da aplicação. A interface reage repintando os elementos com base nos novos valores:

```
[Ação Física: Toque / Teclado]
              │
              ▼
    [Disparo do Evento]
       (onPress, onChangeText)
              │
              ▼
     [Função Manipuladora]
       (handleSalvar, setValor)
              │
              ▼
   [Atualização do Estado]
              │
              ▼
[Re-renderização Automática da Tela]
```

### Passagem de Referência versus Execução Imediata
Atenção na escrita do JSX:
```tsx
// ERRADO: Os parênteses executam a função durante a renderização inicial
<Button title="Salvar" onPress={handleSalvar()} />

// CORRETO: Passa a referência da função para ser chamada apenas no clique
<Button title="Salvar" onPress={handleSalvar} />

// CORRETO: Quando for necessário passar argumentos
<Button title="Excluir" onPress={() => handleExcluir(id)} />
```

### Eventos dos Principais Componentes

#### 1. `<Pressable>`
Substituto moderno de botões com controle sobre os estados de pressão:
- `onPress`: Toque padrão finalizado.
- `onPressIn`: Início do contato com o dedo.
- `onPressOut`: Fim do contato com o dedo.
- `onLongPress`: Toque prolongado (segurando por mais de meio segundo).

#### 2. `<TextInput>`
- `onChangeText`: Recebe o texto diretamente como string a cada tecla digitada.
- `onFocus`: Disparado quando o campo ganha atenção do usuário.
- `onBlur`: Disparado quando o usuário clica fora do campo (útil para acionar rotinas de validação).
- `onSubmitEditing`: Disparado ao pressionar o botão de confirmação no teclado virtual.

#### 3. `<Switch>`
- `value`: Propriedade booleana indicando se a chave está ligada ou desligada.
- `onValueChange`: Callback disparado com o novo valor booleano resultante do toque.

#### 4. `<ScrollView>` e `<FlatList>`
- `<ScrollView>`: Utilizado para conteúdos estáticos ou pequenos. Possui o evento `onScroll`, que informa as coordenadas de deslocamento em `event.nativeEvent.contentOffset.y`.
- `<FlatList>`: Utilizado para listagens longas com reciclagem de componentes na memória.
  - `onRefresh`: Gatilho disparado ao puxar o topo da lista para baixo (pull-to-refresh).
  - `onEndReached`: Gatilho disparado quando a rolagem atinge o final da lista, usado para carregar novas páginas de registros.

#### 5. O Evento `onLayout`
Diferente das ações do usuário, o `onLayout` é um evento emitido pelo sistema operacional no momento em que o componente tem suas dimensões e coordenadas calculadas na tela:
```tsx
<View
  onLayout={(event) => {
    const { width, height } = event.nativeEvent.layout;
    console.log(`Dimensões reais calculadas: ${width}x${height}`);
  }}
/>
```

### Links de Apoio
- [Guia Oficial do React: Responding to Events](https://react.dev/learn/responding-to-events)
- [Documentação Oficial: Componente Pressable](https://reactnative.dev/docs/pressable)
- [Documentação Oficial: Componente TextInput](https://reactnative.dev/docs/textinput)
- [Documentação Oficial: Componente FlatList](https://reactnative.dev/docs/flatlist)

---

## 9. Construção de Telas Dinâmicas, Imagens e Listas de Alta Performance (Aula 11)

### A Ilusão da Complexidade
Aplicativos com fluxos intensos de dados, como Instagram, Facebook e Uber, parecem complexos à primeira vista. Na prática, suas interfaces são construídas pela combinação de poucos blocos fundamentais de interface: contêineres de alinhamento, campos de texto, imagens e listas dinâmicas. Entender como esses blocos operam em conjunto permite reproduzir telas comerciais com estabilidade e bom desempenho.

### O Dicionário Web para Mobile
Diferente da web, onde tags HTML genéricas (`<div>`, `<span>`) recebem qualquer tipo de dado, o React Native utiliza componentes nativos especializados:

| Web (HTML) | React Native | Finalidade |
| :--- | :--- | :--- |
| `<div>` | `<View>` | Contêiner principal para estruturar blocos com Flexbox. |
| `<p>`, `<span>` | `<Text>` | Exibição obrigatória de qualquer sequência de texto. |
| `<img>` | `<Image>` | Exibição de mídia visual local ou remota. |
| `<input>` | `<TextInput>` | Entrada e captura de dados digitados pelo usuário. |

### Manipulação de Imagens e a Regra de Ouro
O componente `<Image>` lida com dois tipos de arquivos de mídia: locais e remotos. Cada formato exige uma sintaxe diferente.

#### Imagens Locais
Para arquivos estáticos salvos no projeto (como na pasta `assets`), utiliza-se a função `require()`:
```tsx
<Image source={require('./assets/perfil.png')} style={styles.fotoLocal} />
```
O empacotador Metro identifica as dimensões originais do arquivo durante o empacotamento, dispensando largura e altura obrigatórias no estilo inicial.

#### Imagens Remotas
Para imagens carregadas pela internet, a propriedade `source` recebe um objeto com o atributo `uri`:
```tsx
<Image
  source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' }}
  style={styles.fotoRemota}
  onError={() => console.log('Falha ao descarregar a imagem')}
/>
```

#### A Regra de Dimensões para Imagens Remotas
Imagens remotas exigem largura e altura explícitas no estilo (`width` e `height`). Como o React Native não conhece o arquivo antes do download, a imagem assume tamanho zero por padrão se as dimensões forem omitidas, ficando invisível na tela.
O evento `onError` deve ser associado para monitorar links inválidos ou falhas de conexão, prevenindo telas vazias sem aviso.

### Captura de Dados e o Ciclo do Input Controlado
Um `<TextInput>` inserido na tela sem integração com o estado do React funciona apenas como um elemento visual solto. Os dados digitados não ficam disponíveis para validação ou envio.

#### O Ciclo do Estado como Fonte da Verdade
No React Native, a interface reflete diretamente o estado da aplicação. O fluxo de um campo controlado opera em um ciclo contínuo:
1. O estado é declarado com `useState` para guardar o valor atual do texto.
2. A propriedade `value` do `<TextInput>` recebe a variável de estado.
3. Quando o usuário digita no teclado, o evento `onChangeText` dispara a função despachante do estado com o novo texto.
4. A atualização do estado provoca uma nova renderização, exibindo os caracteres atualizados no campo.

Exemplo de implementação:
```tsx
import { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export function CampoBusca() {
  const [termo, setTermo] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        value={termo}
        onChangeText={setTermo}
        placeholder="Digite o nome para buscar..."
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />
      <Text style={styles.feedback}>Termo pesquisado: {termo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  feedback: { marginTop: 8, fontSize: 14, color: '#64748B' },
});
```

### O Problema do Conteúdo que Excede a Tela: ScrollView vs FlatList
Quando formulários longos, textos ou listas ultrapassam o limite da tela do aparelho, a interface corta o conteúdo. O React Native oferece dois componentes principais para habilitar rolagem, cada um com comportamento de memória distinto.

#### A Limitação do ScrollView
O componente `<ScrollView>` carrega todos os seus elementos filhos na memória simultaneamente na inicialização da tela:
- **Cenários adequados:** formulários pequenos de tamanho fixo, termos de uso, telas de login e artigos de texto.
- **Risco de desempenho:** ao listar coleções com dezenas ou centenas de itens, o consumo de memória RAM sobe rapidamente. Isso causa perda de fluidez na rolagem e encerramentos forçados do aplicativo pelo sistema operacional.

#### Otimização com FlatList e Lazy Loading
O componente `<FlatList>` adota o carregamento sob demanda (*Lazy Loading*). Ele processa e renderiza exclusivamente os itens que cabem no visor do usuário no momento, junto a uma pequena margem de segurança.
Conforme a rolagem avança, os itens que saem do visor são desmontados e seus nós são reaproveitados. Esse mecanismo estabiliza o consumo de memória, seja a lista composta por 15 itens ou por 10.000 itens.

#### Matriz de Decisão: ScrollView vs FlatList

| Critério | ScrollView | FlatList |
| :--- | :--- | :--- |
| **Mecanismo** | Renderiza todos os nós de uma só vez | Renderiza sob demanda (*Lazy Loading*) |
| **Uso Ideal** | Formulários estáticos e blocos de texto | Feeds dinâmicos e grandes coleções |
| **Consumo de Memória** | Aumenta proporcionalmente ao tamanho do conteúdo | Estável mesmo com grandes volumes |
| **Declaração** | Envolve componentes filhos como JSX comum | Exige `data`, `renderItem` e `keyExtractor` |

> [!WARNING] Atenção Técnica
> Utilizar `ScrollView` para carregar listas dinâmicas com tamanho variável é um dos principais erros de desempenho em projetos mobile.

### Anatomia da FlatList
Para renderizar dados de forma correta, o componente `<FlatList>` exige três propriedades estruturais:
1. `data`: o array de dados com as informações brutas a serem exibidas.
2. `renderItem`: função que atua como molde visual. Ela recebe um objeto contendo o `item` atual e retorna o código JSX que desenha a linha ou cartão na tela.
3. `keyExtractor`: função que retorna uma string de identificação única para cada registro. Essa chave orienta o algoritmo interno do React a rastrear alterações, ordenações e exclusões sem renderizar elementos incorretos.

Exemplo completo de listagem:
```tsx
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

type Usuario = {
  id: string;
  nome: string;
  papel: string;
  avatar: string;
};

const equipe: Usuario[] = [
  { id: '1', nome: 'Ana Beatriz', papel: 'Desenvolvedora Mobile', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', nome: 'Carlos Eduardo', papel: 'Engenheiro de Dados', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', nome: 'Daniela Rocha', papel: 'Product Designer', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', nome: 'Felipe Santos', papel: 'Arquiteto de Software', avatar: 'https://i.pravatar.cc/150?img=4' },
];

export function ListaEquipe() {
  return (
    <FlatList
      data={equipe}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.cartao}>
          <Image source={{ uri: item.avatar }} style={styles.foto} />
          <View style={styles.conteudo}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.papel}>{item.papel}</Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  foto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  conteudo: { marginLeft: 12 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  papel: { fontSize: 14, color: '#64748B', marginTop: 2 },
});
```

### O que o Mercado Avalia em Testes Técnicos
Em avaliações práticas e entrevistas para vagas mobile, avaliadores analisam a atenção a detalhes que diferenciam iniciantes de profissionais preparados:
- **Uso indevido de ScrollView:** aplicar `ScrollView` em feeds dinâmicos demonstra desconhecimento sobre o consumo de memória do dispositivo móvel.
- **Omissão de keyExtractor:** deixar de declarar chaves únicas na `FlatList` faz o React usar índices de array, gerando avisos no terminal e erros na atualização de itens.
- **Imagens sem largura e altura:** omitir o estilo em `<Image source={{ uri: ... }} />` faz o componente não ocupar espaço visual na tela.
- **Descuido com acessibilidade:** esquecer a propriedade `accessible` e rótulos de leitura em botões e imagens reduz a usabilidade do aplicativo para pessoas com deficiência visual.
- **Controle de formulários:** manter os campos sincronizados com variáveis de estado através do ciclo `value` e `onChangeText`.

### Os Cinco Blocos Estruturais do React Native
Qualquer interface mobile de grande porte é fundamentada em cinco componentes principais:
- `<View>` para contêineres e caixas de posicionamento.
- `<Text>` para qualquer exibição de caracteres e textos.
- `<Image>` para mídias locais e remotas.
- `<TextInput>` para captura de digitação.
- `<FlatList>` para coleções com alta eficiência de memória.

### Links de Apoio
- [Documentação Oficial: Componente Image](https://reactnative.dev/docs/image)
- [Documentação Oficial: Componente FlatList](https://reactnative.dev/docs/flatlist)
- [Documentação Oficial: Componente TextInput](https://reactnative.dev/docs/textinput)
- [Guia Oficial: Otimização de Desempenho com FlatList](https://reactnative.dev/docs/optimizing-flatlist-configuration)

---


## 10. Navegação entre Telas e Expo Router (Aula 12)

### O Fim do Boilerplate e o Modelo Mental Baseado em Arquivos
Nas versões clássicas de navegação com React Navigation, a definição de rotas exigia a criação de arquivos de configuração centralizados, instanciando contêineres de navegação (`NavigationContainer`) e pilhas manuais (`createStackNavigator`). O código ficava disperso e propenso a falhas na sincronização das telas.

O Expo Router adota o **roteamento baseado em arquivos (file-based routing)**, padrão consagrado no desenvolvimento web por frameworks como o Next.js. Toda a hierarquia de navegação é determinada pela disposição física dos arquivos dentro do diretório `app/`. Criar um arquivo ou diretório equivale a registrar imediatamente uma nova tela navegável, eliminando arquivos de configuração centralizados.

Essa abordagem segue princípios estruturais:
- **Universalidade:** O mesmo código de navegação funciona de forma consistente no Android, no iOS e na Web.
- **Facilidade de Uso:** Elimina configurações centralizadas. Adicionar um arquivo cria a rota correspondente.
- **Flexibilidade:** Oferece suporte completo a rotas dinâmicas, parâmetros de navegação, deep linking e aninhamento de layouts.

### Mapeamento de Rotas e Convenções de Nomenclatura
O Expo Router traduz caminhos de arquivos em rotas acessíveis por meio de convenções diretas:
- **Rota Raiz (`/`):** O arquivo `app/index.js` (ou `.tsx`) representa a tela inicial da aplicação. Arquivos com o nome `index` assumem a rota do diretório pai e não acrescentam segmentos extras ao endereço.
- **Rotas Simples:** O arquivo `app/home.js` responde pelo caminho `/home`.
- **Rotas em Diretórios:** O arquivo `app/settings/index.js` responde pelo caminho `/settings`.
- **Grupos de Rotas:** Pastas com nomes entre parênteses, como `app/(tabs)/`, agrupam layouts compartilhados sem adicionar o nome da pasta à URL visível.

Exemplo de declaração da tela inicial (`app/index.tsx`):
```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function TelaInicial() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Página Inicial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  texto: { fontSize: 18, color: '#0F172A' },
});
```

### Rotas Dinâmicas (Slugs)
Quando uma tela precisa exibir dados específicos de um registro com base no identificador da URL, o nome do arquivo recebe colchetes `[parametro]`. Os colchetes indicam que aquele segmento da URL é uma variável:
- `app/[user].tsx`: Atende caminhos como `/diego` ou `/mayk`.
- `app/blog/[id].tsx`: Atende caminhos como `/blog/123` ou `/blog/450`.

### Rotas com Sintaxe Rest
Para capturar caminhos profundos com múltiplos subníveis não mapeados previamente em arquivos fixos, utiliza-se a sintaxe Rest com reticências dentro dos colchetes:
- Arquivo: `app/blog/[...id].tsx`
- Ao acessar a URL `/blog/123/settings`, o Expo Router agrupa os segmentos restantes em um array de strings: `['123', 'settings']`.

### Captura de Parâmetros com `useLocalSearchParams`
Para ler os parâmetros enviados pela rota na tela de destino, utiliza-se o Hook `useLocalSearchParams` disponibilizado pelo pacote `expo-router`.

Exemplo de leitura de parâmetro dinâmico em `app/blog/[slug].tsx`:
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TelaDetalheBlog() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>Postagem selecionada:</Text>
      <Text style={styles.valor}>{slug}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  rotulo: { fontSize: 16, color: '#64748B' },
  valor: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginTop: 8 },
});
```

### Regras de Especificidade de Rotas
Quando existem arquivos com caminhos estáticos e arquivos com parâmetros dinâmicos no mesmo nível de diretório, o Expo Router aplica uma regra estrita de precedência:
> [!IMPORTANT] Precedência de Resolução
> Rotas estáticas (exatas) sempre têm prioridade sobre rotas dinâmicas.

Fluxo de decisão ao processar a requisição da rota `/blog/destaque`:
1. O sistema verifica se existe o arquivo exato `app/blog/destaque.tsx`. Caso exista, ele é renderizado diretamente (alta especificidade).
2. Se o arquivo exato não for localizado, o sistema recorre à rota dinâmica genérica `app/blog/[id].tsx`, atribuindo o valor `'destaque'` ao parâmetro `id` (baixa especificidade).

### Tipos de Navegadores: Stack vs Tabs
A organização de navegação no Expo Router baseia-se em dois tipos principais de contêineres:

| Característica | Stack Navigator (`type: 'stack'`) | Tabs Navigator (`type: 'tab'`) |
| :--- | :--- | :--- |
| **Estrutura** | Pilha de telas sequenciais sobrepostas | Barra de navegação com alternância de abas |
| **Histórico** | Modelo LIFO (Last In, First Out) | Mantém histórico e páginas pré-carregadas (`preloadedRouteKeys`) |
| **Aplicação** | Fluxos detalhados, cadastros passo a passo e telas filhas | Menus principais e seções de topo da aplicação |

### Comportamento do Botão Voltar nas Abas (`backBehavior`)
Em dispositivos com suporte ao botão físico ou gestual de retorno (como no Android), a propriedade `backBehavior` define como o sistema reage quando a pessoa usuária pressiona voltar dentro de uma navegação por abas:

| Opção | Ação Executada ao Pressionar Voltar |
| :--- | :--- |
| `firstRoute` | Retorna para a primeira aba configurada na lista do navegador. |
| `initialRoute` | Retorna para a aba designada pela propriedade `initialRouteName`. |
| `order` | Retorna para a aba posicionada imediatamente antes da aba em foco. |
| `history` | Retorna para a última aba visitada, reproduzindo a experiência de histórico de um navegador web. |

### Links de Apoio
- [Documentação Oficial: Expo Router Routing Basics](https://docs.expo.dev/router/create-pages/)
- [Documentação Oficial: Expo Router Dynamic Routes](https://docs.expo.dev/router/dynamic-routes/)
- [Documentação Oficial: useLocalSearchParams](https://docs.expo.dev/router/reference/hooks/#uselocalsearchparams)
- [Documentação Oficial: Expo Router Tab Navigation](https://docs.expo.dev/router/advanced/tabs/)

---

## 11. Gerenciamento de Estado Avançado e Ciclo de Vida com Hooks (Aula 13)

### A Mudança Arquitetural: De Classes para Funções com Hooks
Historicamente, o React exigia a escrita de componentes de classe (`class MeuComponente extends React.Component`) para controlar dados mutáveis e executar operações de ciclo de vida:
- O estado dependia da inicialização de `this.state` e da invocação explícita de `this.setState`.
- A lógica de uma mesma rotina precisava ser dispersa entre diferentes métodos de ciclo de vida, como `componentDidMount`, `componentDidUpdate` e `componentWillUnmount`.
- O código tornava-se extenso, propenso a vazamentos de memória e difícil de reaproveitar entre componentes.

A chegada dos Hooks permitiu que componentes funcionais simples gerenciem estado interno e sincronizem operações externas. As regras de negócio ficam agrupadas em funções diretas e organizadas por objetivo.

### As Três Regras dos Hooks
Para que o React controle os valores entre renderizações sem erros de referência, três regras precisam ser seguidas:
1. **Apenas em Funções:** Chame Hooks exclusivamente dentro de componentes funcionais do React ou dentro de Hooks customizados.
2. **Nível Superior (Top-Level):** Posicione as chamadas aos Hooks no início do corpo da função, antes de cláusulas de retorno (`return`), estruturas condicionais ou laços de repetição.
3. **Nunca em Condicionais ou Laços:** Não coloque chamadas como `useState` ou `useEffect` dentro de `if/else`, laços `for/while` ou funções internas aninhadas. O React depende da ordem fixa de invocação dos Hooks a cada renderização para associar cada estado à sua variável.

### Anatomia do `useState`
A declaração do Hook de estado utiliza a desestruturação de array:
```tsx
const [contador, setContador] = useState(0);
```
- `contador`: O valor atual da variável de estado. Possui caráter de leitura e não deve sofrer alteração por atribuição direta.
- `setContador`: Função modificadora encarregada de receber o novo valor e agendar a re-renderização do componente no React.
- `0`: Valor inicial atribuído ao estado apenas na primeira montagem do componente na tela.

### Efeitos Colaterais e a Finalidade do `useEffect`
Em componentes funcionais, o corpo da função destina-se ao cálculo do JSX. Ações que se comunicam com o ambiente externo à interface são chamadas de **efeitos colaterais (side effects)**:
- Requisições assíncronas a APIs externas via `fetch`.
- Inscrições em servidores via WebSockets.
- Disparo de temporizadores através de `setTimeout` ou `setInterval`.
- Leituras de sensores do dispositivo ou acesso ao armazenamento local.

Executar essas operações diretamente no corpo da renderização causa execuções descontroladas a cada repintura de tela. O Hook `useEffect` define o momento seguro para rodar essas rotinas após a exibição dos elementos na tela.

### Anatomia do `useEffect` e Ciclo de Vida
A estrutura formal do `useEffect` é composta pela rotina principal, uma função opcional de limpeza e o array de dependências:
```tsx
useEffect(() => {
  // Lógica principal de execução (Setup)

  return () => {
    // Lógica opcional de encerramento (Cleanup)
  };
}, [dependencias]);
```

O ciclo de vida do efeito ocorre em três fases:
1. **Montagem (Mount):** O componente é desenhado na tela e o React executa a função de Setup pela primeira vez.
2. **Atualização (Update):** Quando uma das variáveis listadas no array de dependências sofre alteração de valor, o React primeiro executa o Cleanup com os valores anteriores e, em seguida, executa o novo Setup com os valores atualizados.
3. **Desmontagem (Unmount):** Quando o componente é desmontado e retirado da tela, o React executa o Cleanup final para liberar recursos e conexões abertas.

### A Matriz do Array de Dependências
O segundo argumento do `useEffect` determina a frequência de execução da rotina:

| Declaração do Array | Frequência de Execução | Aplicação Prática |
| :--- | :--- | :--- |
| **Array Omitido**<br>`useEffect(() => { ... })` | Executa após cada renderização do componente. | Raramente recomendado. Risco severo de loops infinitos caso atualize estado dentro da função. |
| **Array Vazio**<br>`useEffect(() => { ... }, [])` | Executa somente uma vez, logo após a montagem inicial. | Requisições iniciais a APIs para preenchimento de telas e listas de dados. |
| **Array com Valores**<br>`useEffect(() => { ... }, [filtro])` | Executa na montagem e sempre que a variável listada mudar de valor. | Atualizar dados quando a pessoa usuária altera um filtro, termo de busca ou paginação. |

### Prevenção de Condições de Corrida com a Função Cleanup
Quando uma tela dispara buscas de rede em resposta rápida a digitações ou filtros, requisições antigas podem demorar mais para responder do que requisições novas. Sem um controle adequado, isso gera uma **condição de corrida (race condition)**, na qual a resposta atrasada sobrescreve dados mais recentes na tela.

A função Cleanup retornada pelo `useEffect` evita esse problema ao invalidar a requisição anterior antes que a próxima seja concluída:
```tsx
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export function PerfilUsuario({ idUsuario }: { idUsuario: string }) {
  const [usuario, setUsuario] = useState<{ nome: string } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    async function buscarPerfil() {
      try {
        const resposta = await fetch(`https://api.exemplo.com/usuarios/${idUsuario}`);
        const dados = await resposta.json();
        if (ativo) {
          setUsuario(dados);
        }
      } catch (erro) {
        console.error('Falha ao obter perfil:', erro);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    buscarPerfil();

    return () => {
      ativo = false;
    };
  }, [idUsuario]);

  if (carregando) {
    return <ActivityIndicator size="large" color="#2563EB" style={styles.centralizado} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Nome: {usuario ? usuario.nome : 'Registro não localizado'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  texto: { fontSize: 16, color: '#1E293B' },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
```

### Isolamento de Regras em Hooks Customizados
Quando um componente passa a acumular múltiplos estados e efeitos para coordenar uma mesma funcionalidade, a prática recomendada consiste em extrair essa lógica para um **Hook Customizado**.

A função utiliza o prefixo convencional `use` (como `useUsuario` ou `useNotificacoes`) e centraliza chamadas a `useState` e `useEffect`. O componente de tela recebe apenas as variáveis prontas e funções de disparo, mantendo sua estrutura focada exclusivamente na renderização do JSX.

### Diagnóstico de Falhas Frequentes

| Falha Identificada | Causa Provável | Procedimento de Correção |
| :--- | :--- | :--- |
| **Loop Infinito (Interface Trava)** | Chamar a função modificadora de estado dentro do `useEffect` sem especificar o array de dependências. | Definir o array com `[]` ou incluir apenas as variáveis de gatilho pertinentes. |
| **Cintilação Visual (Flicker)** | Modificações de layout ou medidas geométricas disparadas após a tela já ter sido pintada. | Em medições síncronas antes da pintura, avaliar o uso de `useLayoutEffect`. |
| **Dados Desatualizados (Stale State)** | Utilizar variáveis de estado ou propriedades no efeito sem incluí-las na lista de dependências. | Adicionar todas as referências externas utilizadas pelo efeito ao array de dependências. |

### Links de Apoio
- [Documentação Oficial do React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [Documentação Oficial do React: useEffect Reference](https://react.dev/reference/react/useEffect)
- [Documentação Oficial do React: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## 12. Laboratórios Práticos de Integração

### Laboratório A: Formulário Interativo com Validação e Estado
Exemplo integrando formulário, validação, estado booleano, responsividade e eventos em um componente completo:

```tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';

export default function TelaCredenciamento() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [nome, setNome] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [campoFocado, setCampoFocado] = useState(false);

  function submeterFormulario() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Preencha o seu nome completo.');
      return;
    }
    if (!termosAceitos) {
      Alert.alert('Aviso', 'Você precisa concordar com os termos.');
      return;
    }
    Alert.alert('Sucesso', `Inscrição confirmada para ${nome}!`);
  }

  return (
    <View style={[styles.tela, isTablet && styles.telaTablet]}>
      <Text style={styles.titulo}>Credenciamento do Evento</Text>

      <View style={styles.campoGrupo}>
        <Text style={styles.rotulo}>Nome do Participante</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          onFocus={() => setCampoFocado(true)}
          onBlur={() => setCampoFocado(false)}
          placeholder="Digite seu nome completo"
          style={[styles.input, campoFocado && styles.inputFocado]}
        />
      </View>

      <View style={styles.linhaSwitch}>
        <Text style={styles.textoSwitch}>Li e concordo com o regulamento</Text>
        <Switch value={termosAceitos} onValueChange={setTermosAceitos} />
      </View>

      <Pressable
        onPress={submeterFormulario}
        style={({ pressed }) => [
          styles.botao,
          pressed ? styles.botaoPressionado : styles.botaoPadrao,
        ]}
      >
        <Text style={styles.textoBotao}>Confirmar Inscrição</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  telaTablet: {
    paddingHorizontal: 80,
    maxWidth: 550,
    alignSelf: 'center',
    width: '100%',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0F172A',
  },
  campoGrupo: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputFocado: {
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  linhaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  textoSwitch: {
    fontSize: 14,
    color: '#475569',
  },
  botao: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoPadrao: {
    backgroundColor: '#2563EB',
  },
  botaoPressionado: {
    backgroundColor: '#1D4ED8',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### Laboratório B: Tela Dinâmica com Busca em Tempo Real e Listagem Otimizada
Aplicação do desafio prático da Aula 11. O componente combina layout estruturado com `<View>`, campo de busca filtrado via `<TextInput>`, listagem em `<FlatList>` e fotos de perfil remotas com dimensões explícitas no `<Image>`:

```tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

type ItemUsuario = {
  id: string;
  nome: string;
  funcao: string;
  fotoUrl: string;
};

const dadosIniciais: ItemUsuario[] = [
  { id: '1', nome: 'Lucas Oliveira', funcao: 'Desenvolvedor Frontend', fotoUrl: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', nome: 'Mariana Silva', funcao: 'Arquiteta Cloud', fotoUrl: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', nome: 'Rafael Santos', funcao: 'Engenheiro de QA', fotoUrl: 'https://i.pravatar.cc/150?img=13' },
  { id: '4', nome: 'Camila Lima', funcao: 'Scrum Master', fotoUrl: 'https://i.pravatar.cc/150?img=14' },
  { id: '5', nome: 'Gustavo Souza', funcao: 'Analista de Segurança', fotoUrl: 'https://i.pravatar.cc/150?img=15' },
];

export default function TelaBuscaUsuarios() {
  const [busca, setBusca] = useState('');

  const usuariosFiltrados = dadosIniciais.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.conteiner}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Diretório de Membros</Text>
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Filtrar membro por nome..."
          placeholderTextColor="#94A3B8"
          style={styles.campoBusca}
        />
      </View>

      <FlatList
        data={usuariosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartao}>
            <Image
              source={{ uri: item.fotoUrl }}
              style={styles.avatar}
              onError={() => console.log(`Erro ao carregar imagem de ${item.nome}`)}
            />
            <View style={styles.detalhes}>
              <Text style={styles.nomeMembro}>{item.nome}</Text>
              <Text style={styles.funcaoMembro}>{item.funcao}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.areaVazia}>
            <Text style={styles.textoVazio}>Nenhum membro encontrado com esse nome.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteiner: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cabecalho: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  campoBusca: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  lista: {
    padding: 16,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  detalhes: {
    marginLeft: 14,
  },
  nomeMembro: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  funcaoMembro: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  areaVazia: {
    padding: 32,
    alignItems: 'center',
  },
  textoVazio: {
    fontSize: 15,
    color: '#94A3B8',
  },
});
```


### Laboratório C: Navegação com Rota Dinâmica e Parâmetros (Expo Router)
Exemplo prático simulando o fluxo de catálogo para detalhes do produto. Demonstra a criação da tela receptora com rota dinâmica `app/produto/[id].tsx` e a captura dos dados passados na navegação por meio de `useLocalSearchParams`:

```tsx
// Arquivo: app/produto/[id].tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TelaDetalheProduto() {
  const router = useRouter();
  const { id, nome, preco } = useLocalSearchParams<{
    id: string;
    nome?: string;
    preco?: string;
  }>();

  return (
    <View style={styles.conteiner}>
      <Text style={styles.categoria}>Detalhes do Produto</Text>
      <Text style={styles.titulo}>{nome ?? 'Item sem título'}</Text>
      <Text style={styles.codigo}>Código identificador: #{id}</Text>
      {preco && <Text style={styles.preco}>R$ {preco}</Text>}

      <Pressable onPress={() => router.back()} style={styles.botaoVoltar}>
        <Text style={styles.textoBotao}>Retornar ao Catálogo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  conteiner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  categoria: { fontSize: 14, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  codigo: { fontSize: 14, color: '#94A3B8', marginBottom: 12 },
  preco: { fontSize: 22, fontWeight: 'bold', color: '#16A34A', marginBottom: 24 },
  botaoVoltar: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
```

### Laboratório D: Consumo Assíncrono com `useEffect`, Indicador de Carregamento e Cleanup
Aplicação do padrão de sincronização da Aula 13. O componente busca uma lista de postagens em uma API remota simulada, exibe o componente `ActivityIndicator` durante a requisição, trata erros e emprega a função de limpeza para evitar atualização de estado após o componente ser desmontado:

```tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';

type Postagem = {
  id: number;
  title: string;
  body: string;
};

export default function TelaListagemPosts() {
  const [posts, setPosts] = useState<Postagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [recarregarGatilho, setRecarregarGatilho] = useState(0);

  useEffect(() => {
    let montado = true;
    setCarregando(true);
    setErro(null);

    async function carregarPosts() {
      try {
        const resposta = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
        if (!resposta.ok) {
          throw new Error(`Erro na resposta: ${resposta.status}`);
        }
        const dados: Postagem[] = await resposta.json();
        if (montado) {
          setPosts(dados);
        }
      } catch (err: any) {
        if (montado) {
          setErro(err.message || 'Falha ao buscar dados');
        }
      } finally {
        if (montado) {
          setCarregando(false);
        }
      }
    }

    carregarPosts();

    return () => {
      montado = false;
    };
  }, [recarregarGatilho]);

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoCarregando}>Carregando postagens...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.textoErro}>Ocorreu uma falha: {erro}</Text>
        <Pressable
          onPress={() => setRecarregarGatilho((antigo) => antigo + 1)}
          style={styles.botaoTentar}
        >
          <Text style={styles.textoBotao}>Tentar Novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.conteiner}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cartao}>
            <Text style={styles.tituloPost}>{item.title}</Text>
            <Text style={styles.corpoPost}>{item.body}</Text>
          </View>
        )}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteiner: { flex: 1, backgroundColor: '#F8FAFC' },
  lista: { padding: 16 },
  cartao: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  tituloPost: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  corpoPost: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoCarregando: { marginTop: 12, fontSize: 15, color: '#64748B' },
  textoErro: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginBottom: 16 },
  botaoTentar: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  textoBotao: { color: '#FFFFFF', fontWeight: '600' },
});
```

---

## 13. Questões de Fixação e Simulado para a Prova

### Questão 1
**Enunciado:** Em um componente, um estudante escreveu `<Button title="Processar" onPress={executar()} />`. Ao carregar o aplicativo, a função `executar` roda automaticamente sem que ninguém tenha clicado no botão. O que motivou esse comportamento e como resolver?
- **Resposta:** A inclusão dos parênteses `()` faz com que a função seja invocada imediatamente durante a execução do JSX no momento da renderização. Para resolver, passa-se somente a referência da função sem parênteses: `onPress={executar}`.

### Questão 2
**Enunciado:** Qual é a diferença no valor padrão da propriedade `flexDirection` entre o CSS tradicional da Web e o Flexbox no React Native?
- **Resposta:** Na Web, o padrão de `flex-direction` é horizontal (`row`). No React Native, o padrão é vertical (`column`), alinhado ao formato e orientação natural das telas de smartphones.

### Questão 3
**Enunciado:** Por que a declaração direta `state.contador = 5` é considerada incorreta no React Native?
- **Resposta:** O React Native depende da chamada da função despachante (`setContador`) para ser notificado de que dados mudaram e agendar o recálculo da tela (re-render). A alteração direta não emite notificações internas, deixando a interface desatualizada com dados antigos.

### Questão 4
**Enunciado:** Se dois componentes irmãos precisam consultar e alterar uma mesma variável, qual é o padrão recomendado pela arquitetura do React?
- **Resposta:** Utiliza-se a elevação de estado (*Lifting State Up*). O estado é declarado no ancestral comum mais próximo aos dois componentes. Esse pai distribui o valor aos filhos através de propriedades normais e disponibiliza funções de retorno (callbacks) para que os filhos requisitem alterações no valor central.

### Questão 5
**Enunciado:** Qual é a diferença de comportamento entre o Live Reload e o Fast Refresh durante o desenvolvimento com Expo?
- **Resposta:** O Live Reload forçava o recarregamento total da aplicação a cada arquivo alterado, limpando formulários e o estado interno dos componentes. O Fast Refresh atualiza cirurgicamente apenas os módulos modificados, preservando os dados do estado que a pessoa usuária já havia manipulado.

### Questão 6
**Enunciado:** Um desenvolvedor adicionou uma foto remota ao aplicativo usando `<Image source={{ uri: 'https://exemplo.com/foto.png' }} />`, mas o elemento não apareceu na tela, sem acusar erro no console. Qual é o motivo desse comportamento e qual ajuste de código é necessário?
- **Resposta:** No React Native, imagens carregadas via rede não possuem dimensões nativas conhecidas antes do download. Se o desenvolvedor não definir `width` e `height` explicitamente no estilo, o componente assume tamanho 0x0 e não aparece. A correção consiste em declarar largura e altura na folha de estilo associada ao componente.

### Questão 7
**Enunciado:** Por qual razão técnica o uso de `<ScrollView>` é desaconselhado para exibir coleções extensas de dados, como feeds de postagens ou catálogos de produtos? Qual componente resolve esse problema e qual mecanismo ele emprega?
- **Resposta:** O `<ScrollView>` instancia e mantém na memória do dispositivo todos os elementos filhos simultaneamente, mesmo os itens que estão fora do alcance visual do usuário. Com grandes volumes de registros, isso esgota a memória RAM do aparelho e trava a rolagem da tela. A solução adequada é o `<FlatList>`, que utiliza o mecanismo de carregamento sob demanda (*Lazy Loading*), renderizando apenas os itens visíveis na tela e reciclando os componentes que saem do visor.

### Questão 8
**Enunciado:** Qual é o papel da propriedade `keyExtractor` em uma `<FlatList>` e quais problemas decorrem de sua ausência?
- **Resposta:** A propriedade `keyExtractor` fornece uma chave única em formato string para cada item da coleção de dados. O algoritmo de reconciliação do React usa essa chave para monitorar quais nós foram modificados, inseridos ou removidos. Sem o `keyExtractor`, o React recorre aos índices numéricos do array, emitindo alertas no terminal e podendo gerar falhas visuais ou inconsistências no estado de itens reciclados ao excluir ou reordenar registros.

### Questão 9
**Enunciado:** Como funciona o ciclo do input controlado com `<TextInput>` no React Native e qual é a função das propriedades `value` e `onChangeText`?
- **Resposta:** No ciclo do input controlado, o estado do componente atua como a única fonte da verdade. A propriedade `value` conecta o campo à variável de estado, exibindo sempre o dado atualizado. O evento `onChangeText` detecta cada caractere digitado ou apagado pelo usuário e aciona a função modificadora do estado. Ao ser atualizado, o estado agenda uma nova renderização do componente, mantendo os dados sincronizados.

### Questão 10
**Enunciado:** Diferencie o carregamento de imagens locais e imagens remotas no componente `<Image>` do React Native em relação à sintaxe da propriedade `source`.
- **Resposta:** Para imagens locais salvas dentro do projeto, a propriedade `source` recebe a chamada `require()` apontando para o caminho do arquivo estático (exemplo: `source={require('./assets/icone.png')}`). Para imagens remotas hospedadas em servidores web, a propriedade `source` recebe um objeto com o atributo `uri` contendo o endereço web (exemplo: `source={{ uri: 'https://exemplo.com/icone.png' }}`).

### Questão 11
**Enunciado:** O que caracteriza o roteamento baseado em arquivos (*file-based routing*) utilizado pelo Expo Router e como ele difere do modelo tradicional de navegação?
- **Resposta:** No modelo tradicional com React Navigation manual, as rotas precisam ser registradas explicitamente em arquivos centrais de configuração, instanciando contêineres e definindo listas manuais de telas. No Expo Router, a hierarquia do sistema de arquivos dentro da pasta `app/` define as rotas diretamente: cada arquivo adicionado torna-se imediatamente uma rota acessível, dispensando configurações centralizadas.

### Questão 12
**Enunciado:** Em uma estrutura que contém simultaneamente os arquivos `app/blog/[id].tsx` e `app/blog/destaque.tsx`, qual tela será exibida se o usuário acessar o caminho `/blog/destaque`? Explique a regra aplicada pelo roteador.
- **Resposta:** Será exibido o arquivo `app/blog/destaque.tsx`. O Expo Router adota a regra de especificidade de rotas, na qual rotas estáticas (exatas) possuem prioridade sobre rotas dinâmicas. O arquivo dinâmico `[id].tsx` só é acionado para caminhos que não correspondam a nenhum arquivo de rota estática existente naquele mesmo diretório.

### Questão 13
**Enunciado:** Qual é a finalidade da sintaxe Rest com colchetes e reticências (exemplo: `app/catalogo/[...secoes].tsx`) no Expo Router e em qual formato os dados são entregues pelo Hook `useLocalSearchParams`?
- **Resposta:** A sintaxe Rest permite capturar múltiplos segmentos de caminho em uma única rota quando a profundidade da URL é dinâmica ou desconhecida previamente. O Hook `useLocalSearchParams` entrega os segmentos capturados agrupados em formato de array de strings (por exemplo: acessando `/catalogo/calcados/masculino/esportivo`, `secoes` recebe `['calcados', 'masculino', 'esportivo']`).

### Questão 14
**Enunciado:** Por qual razão o React proíbe expressamente a invocação de Hooks (`useState`, `useEffect`) dentro de blocos condicionais (`if/else`) ou de repetição (`for/while`)?
- **Resposta:** O React associa internamente os estados e efeitos de um componente por meio da ordem sequencial em que os Hooks são executados a cada renderização. Se um Hook estiver dentro de um bloco condicional ou laço, a ordem das chamadas pode variar entre renderizações sucessivas, corrompendo a correspondência do estado interno e gerando falhas operacionais graves.

### Questão 15
**Enunciado:** Explique as diferenças no ciclo de execução do Hook `useEffect` nas seguintes situações: (1) com o array de dependências omitido, (2) com array de dependências vazio `[]`, e (3) com variáveis informadas no array `[filtro]`.
- **Resposta:** Quando omitido (`useEffect(fn)`), o efeito roda após todas as renderizações do componente, o que quase nunca é recomendado devido ao risco de loops infinitos. Quando passado vazio (`useEffect(fn, [])`), o efeito roda apenas uma vez, logo após a primeira renderização (montagem do componente), ideal para carregamento de dados em APIs. Quando contém variáveis (`useEffect(fn, [filtro])`), o efeito executa na montagem e é disparado novamente apenas quando o valor de alguma variável listada for modificado.

### Questão 16
**Enunciado:** Em quais momentos a função de limpeza (*cleanup*) retornada pelo `useEffect` é executada pelo React e qual problema ela resolve em requisições de rede assíncronas?
- **Resposta:** A função de limpeza roda antes de o efeito ser executado novamente (em decorrência da alteração de alguma dependência) e no momento em que o componente é desmontado da tela. Em operações assíncronas, ela evita condições de corrida (*race conditions*) e vazamentos de memória, cancelando ou desconsiderando respostas de requisições que chegariam atrasadas após o usuário já ter mudado de tela ou disparado uma busca mais recente.

### Questão 17
**Enunciado:** Na navegação por abas (`TabNavigationState`), qual é a finalidade da propriedade `backBehavior` e qual comportamento é obtido ao configurá-la com o valor `'history'`?
- **Resposta:** A propriedade `backBehavior` define como o botão nativo de retorno do sistema operacional (como no Android) interage com o navegador de abas. Ao configurá-la com o valor `'history'`, o botão voltar faz a aplicação retroceder pelas abas na ordem em que foram acessadas pela pessoa usuária, reproduzindo o histórico característico de abas em navegadores web.

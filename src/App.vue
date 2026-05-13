<template>
  <!-- Loading inicial de auth -->
  <div v-if="auth.loading" class="app-init">
    <q-spinner-dots color="primary" size="36px" />
  </div>

  <!-- Rotas públicas (portal, login, cadastro) — sem layout -->
  <router-view v-else-if="isPublicRoute" />

  <!-- Layout protegido -->
  <q-layout v-else view="hHh lpR fFf" class="app-layout">

    <!-- ─── Header ───────────────────────────────────────────────── -->
    <q-header class="app-header">
      <q-toolbar style="height: 52px; min-height: 52px; padding: 0 24px">
        <q-btn
          flat dense round size="sm"
          :icon="isMini ? 'menu' : 'menu_open'"
          class="app-menu-btn q-mr-sm"
          aria-label="Toggle sidebar"
          @click="isMini = !isMini"
        />

        <div class="app-breadcrumbs">
          <span class="crumb-root">FineBase</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-now">{{ currentPageName }}</span>
        </div>

        <q-space />

        <div class="app-header-right">
          <div class="app-search" role="button" tabindex="0" @click="searchOpen = true" @keydown.enter="searchOpen = true">
            <q-icon name="search" size="13px" />
            <span>Buscar</span>
            <kbd>⌘K</kbd>
          </div>
          <q-btn
            flat dense round size="12px"
            :icon="isDark ? 'light_mode' : 'dark_mode'"
            class="app-icon-btn"
            :aria-label="isDark ? 'Modo claro' : 'Modo escuro'"
            @click="toggleTheme"
          />
          <div class="app-avatar" :title="auth.userEmail" role="button" tabindex="0">
            {{ auth.userInitials }}
            <q-menu anchor="bottom right" self="top right" :offset="[0, 6]" class="avatar-menu">
              <q-list style="min-width: 172px; padding: 4px 0">
                <q-item clickable v-close-popup @click="$router.push('/perfil')" class="avatar-menu-item">
                  <q-item-section avatar style="min-width: 28px">
                    <q-icon name="manage_accounts" size="15px" style="color: var(--text-3)" />
                  </q-item-section>
                  <q-item-section style="font-size: 13.5px; color: var(--text)">Ver perfil</q-item-section>
                </q-item>
                <q-separator style="margin: 4px 0; border-color: var(--border-soft)" />
                <q-item clickable v-close-popup @click="handleLogout" class="avatar-menu-item avatar-menu-item--danger">
                  <q-item-section avatar style="min-width: 28px">
                    <q-icon name="logout" size="15px" />
                  </q-item-section>
                  <q-item-section style="font-size: 13.5px">Encerrar sessão</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ─── Sidebar ──────────────────────────────────────────────── -->
    <q-drawer
      :model-value="true"
      show-if-above
      class="app-drawer"
      :width="232"
      :mini="isMini"
      :mini-width="56"
    >
      <!-- Brand row -->
      <div class="side-brand" :class="{ 'side-brand--mini': isMini }">
        <div class="side-logo">FB</div>
        <template v-if="!isMini">
          <div>
            <div class="side-brand-name">FineBase</div>
            <div class="side-brand-sub">{{ auth.userName || auth.userEmail }}</div>
          </div>
        </template>
      </div>

      <div v-if="!isMini" class="side-group-label">Navegação</div>

      <!-- Nav items -->
      <div class="side-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <button
            class="side-item"
            :class="{ 'is-active': isActive }"
            @click="navigate"
          >
            <q-icon :name="item.icon" size="16px" class="side-item-icon" />
            <span v-if="!isMini" class="side-item-label">{{ item.label }}</span>
            <span v-if="!isMini && item.count" class="side-item-count">{{ item.count }}</span>
            <q-tooltip v-if="isMini" anchor="center right" self="center left">
              {{ item.label }}
            </q-tooltip>
          </button>
        </router-link>
      </div>

      <!-- Orçamentos -->
      <div class="side-nav q-mt-xs">
        <button class="side-item" @click="budgetOpen = true">
          <q-icon name="savings" size="16px" class="side-item-icon" />
          <span v-if="!isMini" class="side-item-label">Orçamentos</span>
          <q-tooltip v-if="isMini" anchor="center right" self="center left">Orçamentos</q-tooltip>
        </button>
      </div>

      <!-- Score -->
      <div class="side-nav">
        <router-link to="/score" custom v-slot="{ isActive, navigate }">
          <button
            class="side-item"
            :class="{ 'is-active': isActive }"
            @click="navigate"
          >
            <q-icon name="military_tech" size="16px" class="side-item-icon" />
            <span v-if="!isMini" class="side-item-label">Score</span>
            <q-tooltip v-if="isMini" anchor="center right" self="center left">Score</q-tooltip>
          </button>
        </router-link>
      </div>

      <!-- Balance widget (full mode) -->
      <div v-if="!isMini" class="side-balance">
        <div class="side-balance-header">{{ currentMonthYearLabel }}</div>
        <div class="side-balance-row">
          <span class="lbl">Entradas</span>
          <span class="val pos">+{{ compactMoney(currentMonthIncomes) }}</span>
        </div>
        <div class="side-balance-row">
          <span class="lbl">Gastos</span>
          <span class="val neg">−{{ compactMoney(currentMonthExpenses) }}</span>
        </div>
        <div class="side-balance-row total">
          <span class="lbl">Saldo</span>
          <span class="val" :class="currentMonthBalance >= 0 ? 'pos' : 'neg'">
            {{ currentMonthBalance >= 0 ? '+' : '−' }}{{ compactMoney(Math.abs(currentMonthBalance)) }}
          </span>
        </div>
      </div>

      <!-- Balance widget (mini mode) -->
      <div v-else class="side-balance-mini">
        <q-icon
          name="account_balance_wallet"
          size="16px"
          :style="`color: ${currentMonthBalance >= 0 ? 'var(--pos)' : 'var(--neg)'}`"
        >
          <q-tooltip anchor="center right" self="center left">
            Saldo: {{ formatMoney(currentMonthBalance) }}
          </q-tooltip>
        </q-icon>
      </div>

      <!-- Ajuda + Suporte + Perfil (fixados no fundo) -->
      <div v-if="!isMini" class="side-group-label side-group-label--bottom">Conta</div>
      <div class="side-nav side-nav--bottom" :class="{ 'q-mt-auto': isMini }">
        <router-link to="/perfil" custom v-slot="{ isActive, navigate }">
          <button
            class="side-item"
            :class="{ 'is-active': isActive }"
            @click="navigate"
          >
            <q-icon name="manage_accounts" size="16px" class="side-item-icon" />
            <span v-if="!isMini" class="side-item-label">Perfil</span>
            <q-tooltip v-if="isMini" anchor="center right" self="center left">Perfil</q-tooltip>
          </button>
        </router-link>
        <button class="side-item" @click="helpOpen = true">
          <q-icon name="help_outline" size="16px" class="side-item-icon" />
          <span v-if="!isMini" class="side-item-label">Ajuda</span>
          <q-tooltip v-if="isMini" anchor="center right" self="center left">Ajuda</q-tooltip>
        </button>
        <button class="side-item" @click="supportOpen = true">
          <q-icon name="shield_outlined" size="16px" class="side-item-icon" />
          <span v-if="!isMini" class="side-item-label">Suporte & Legal</span>
          <q-tooltip v-if="isMini" anchor="center right" self="center left">Suporte & Legal</q-tooltip>
        </button>
        <button class="side-item side-item--logout" @click="handleLogout">
          <q-icon name="logout" size="16px" class="side-item-icon" />
          <span v-if="!isMini" class="side-item-label">Sair</span>
          <q-tooltip v-if="isMini" anchor="center right" self="center left">Sair</q-tooltip>
        </button>
      </div>
    </q-drawer>

    <q-page-container class="app-page-container">
      <router-view />
    </q-page-container>

    <!-- ─── Search palette ───────────────────────────────────────── -->
    <SearchDialog v-model="searchOpen" @open-budgets="budgetOpen = true" />

    <!-- ─── Dialog de Orçamentos ────────────────────────────────── -->
    <BudgetDialog v-model="budgetOpen" />

    <!-- ─── Dialog de Ajuda ────────────────────────────────────── -->
    <q-dialog v-model="helpOpen" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="help-dialog">
        <q-toolbar class="help-toolbar">
          <q-icon name="help_outline" size="20px" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-medium" style="font-size:15px">Central de Ajuda — FineBase</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="help-body">
          <div class="help-grid">

            <!-- Intro -->
            <div class="help-intro">
              <p class="text-body2 text-grey-6">
                O FineBase é um app de controle financeiro pessoal. Registre gastos e entradas, acompanhe parcelamentos, defina orçamentos por categoria e visualize tudo no Dashboard.
              </p>
            </div>

            <!-- 1. Dashboard -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="dashboard" size="16px" />
                Dashboard
              </div>
              <q-list class="help-list">
                <q-expansion-item label="Resumo do mês atual" dense>
                  <div class="help-item-body">
                    Exibe entradas, gastos, saldo e maior categoria do <strong>mês atual</strong> (sempre fixo no topo, independente dos filtros).
                    A <strong>taxa de economia</strong> mostra quanto da sua renda sobrou: <code>(saldo ÷ entradas) × 100</code>.
                    O badge "No azul / No vermelho" indica se o saldo é positivo ou negativo.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Filtros de mês e ano" dense>
                  <div class="help-item-body">
                    Use os selects no topo para filtrar os gráficos e tabelas por período.
                    Ao selecionar <strong>1 mês</strong>: visão individual do mês.
                    Ao selecionar <strong>2 ou mais meses</strong>: o card de resumo vira uma <strong>tabela comparativa</strong> lado a lado com entradas, gastos, saldo e maior gasto de cada mês.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Parcelamentos em curso" dense>
                  <div class="help-item-body">
                    Lista todas as compras parceladas ainda em andamento. Mostra a parcela atual (ex: 3/12), o valor mensal e quando termina.
                    A barra de progresso indica quanto do parcelamento já foi pago. Os itens são ordenados pelos que terminam primeiro.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Orçamento por categoria" dense>
                  <div class="help-item-body">
                    Barra de progresso do gasto real vs. limite definido por categoria no mês atual.
                    <br><strong>Verde</strong> — abaixo de 50% do limite
                    <br><strong>Amarelo</strong> — entre 50% e 100%
                    <br><strong>Vermelho</strong> — limite ultrapassado
                    <br>Clique em "Gerenciar" para adicionar ou remover limites por categoria.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Gráficos e tabelas" dense>
                  <div class="help-item-body">
                    Use o botão de alternância (lista / gráfico de barras) para trocar entre modo tabela e modo gráfico.
                    Os gráficos disponíveis incluem: gastos por categoria (pizza ou barras), gastos por mês, dias com maiores gastos, saldo no ano e tendência dos últimos 12 meses.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- 2. Gastos -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="trending_down" size="16px" />
                Gastos
              </div>
              <q-list class="help-list">
                <q-expansion-item label="Como cadastrar um gasto" dense>
                  <div class="help-item-body">
                    Clique em <strong>Adicionar gasto</strong>. Preencha data, descrição, categoria, local (opcional), forma de pagamento, valor e tipo de gasto.
                    O gasto aparecerá na tabela e será contabilizado no Dashboard.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Tipo: Fixo" dense>
                  <div class="help-item-body">
                    Gastos que se repetem todo mês com valor igual ou similar: aluguel, internet, streaming, plano de celular.
                    Use "Gastos Recorrentes" para lançar esses com 1 clique todo mês em vez de cadastrar manualmente.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Tipo: Variável" dense>
                  <div class="help-item-body">
                    Compras pontuais sem recorrência definida: mercado, restaurante, farmácia, passeios. É o tipo mais comum do dia a dia.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Tipo: Parcelado" dense>
                  <div class="help-item-body">
                    Compras divididas em X vezes no cartão. Informe o valor <strong>da parcela</strong> (não o total) e o número de parcelas.
                    <br>Exemplo: TV de R$ 1.200 em 12x → valor: <strong>R$ 100,00</strong>, parcelas: <strong>12</strong>.
                    <br>O sistema calcula automaticamente em qual parcela você está e quando termina.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Importar extrato do Nubank (CSV)" dense>
                  <div class="help-item-body">
                    No app do Nubank: <strong>Meu cartão → Exportar fatura → CSV</strong>.
                    No FineBase, clique em <strong>Importar CSV</strong> na tela de Gastos.
                    O sistema faz a categorização automática por palavras-chave, detecta parcelamentos (ex: "Parcela 3/12") e permite revisar e editar antes de confirmar.
                    Transações negativas (pagamentos recebidos) são ignoradas automaticamente.
                    Duplicatas (mesma data + valor já existente) são sinalizadas.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Exportar CSV" dense>
                  <div class="help-item-body">
                    Clique em <strong>Exportar CSV</strong> para baixar os gastos do período filtrado. O arquivo usa ponto-e-vírgula como separador e BOM UTF-8 para abrir corretamente no Excel em português.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- 3. Entradas -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="trending_up" size="16px" />
                Entradas
              </div>
              <q-list class="help-list">
                <q-expansion-item label="Como cadastrar uma entrada" dense>
                  <div class="help-item-body">
                    Clique em <strong>Adicionar entrada</strong>. Preencha data, descrição, fonte e valor.
                    Entradas são somadas ao saldo do mês e aparecem no Dashboard.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Fontes disponíveis" dense>
                  <div class="help-item-body">
                    <strong>Salário</strong> — renda principal do trabalho
                    <br><strong>Renda Secundária</strong> — freelas, bicos, segunda fonte de renda
                    <br><strong>Vale</strong> — vale alimentação, refeição, transporte
                    <br><strong>Extra</strong> — bônus, comissão, gratificação
                    <br><strong>Presente</strong> — dinheiro recebido de presente
                    <br><strong>Venda</strong> — venda de objetos pessoais
                    <br><strong>Resgate investimento</strong> — retirada de investimentos
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- 4. Recorrentes -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="repeat" size="16px" />
                Gastos Recorrentes
              </div>
              <q-list class="help-list">
                <q-expansion-item label="O que são gastos recorrentes" dense>
                  <div class="help-item-body">
                    São <strong>templates</strong> de gastos fixos mensais — academia, streaming, aluguel, plano de celular.
                    Você cadastra uma vez com descrição, categoria e valor, e usa o botão <strong>"Lançar este mês"</strong> para criar o gasto com a data de hoje, sem precisar preencher tudo novamente.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Como usar" dense>
                  <div class="help-item-body">
                    1. Cadastre o template com os dados do gasto recorrente.
                    <br>2. No início de cada mês, clique em <strong>"Lançar este mês"</strong> no template desejado.
                    <br>3. Um gasto do tipo <em>Fixo</em> é criado com a data de hoje automaticamente.
                    <br>Você pode lançar quantos templates quiser de uma vez.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Diferença: Recorrente vs Parcelado" dense>
                  <div class="help-item-body">
                    <strong>Parcelado</strong> → tem data de início e fim definidos. Ex: celular em 12x R$100 — dura 12 meses e termina.
                    É uma dívida com prazo certo.
                    <br><br>
                    <strong>Recorrente</strong> → não tem data de término. Ex: Netflix, academia, aluguel — você paga todo mês enquanto tiver o serviço/contrato.
                    É uma despesa contínua sem prazo definido.
                    <br><br>
                    <em>Regra prática:</em> se você sabe quantas vezes vai pagar → <strong>Parcelado</strong>. Se é indefinido → <strong>Recorrente</strong>.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- 5. Dicas -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="tips_and_updates" size="16px" />
                Dicas de uso
              </div>
              <q-list class="help-list">
                <q-expansion-item label="Como manter o controle em dia" dense>
                  <div class="help-item-body">
                    • Lance entradas assim que receber (salário, extras).
                    <br>• No início do mês, use "Lançar este mês" nos recorrentes antes de qualquer outra coisa.
                    <br>• Importe o CSV do Nubank semanalmente para não acumular.
                    <br>• Configure orçamentos por categoria para receber alertas visuais quando estiver passando do limite.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Valor da parcela no extrato Nubank" dense>
                  <div class="help-item-body">
                    O extrato do Nubank já exporta o valor de cada parcela individualmente (não o total da compra).
                    Por isso, ao importar ou cadastrar manualmente, informe sempre o <strong>valor da parcela</strong>, não o total.
                    Exemplo: compra de R$ 600 em 6x → o Nubank vai exportar como R$ 100 por mês.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- ─── Dialog de Suporte & Legal ────────────────────────── -->
    <q-dialog v-model="supportOpen" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="help-dialog">
        <q-toolbar class="help-toolbar">
          <q-icon name="shield_outlined" size="20px" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-medium" style="font-size:15px">Suporte & Informações Legais</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="help-body">
          <div class="help-grid">

            <!-- Sobre -->
            <div class="help-intro">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-subtitle2 text-weight-bold">FineBase</div>
                  <div class="text-caption text-grey-6">Controle financeiro pessoal · Versão 1.0 (MVP)</div>
                </div>
                <q-badge color="primary" label="Beta" rounded />
              </div>
            </div>

            <!-- Sobre o app -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="info_outline" size="16px" />
                Sobre o FineBase
              </div>
              <q-list class="help-list">
                <q-expansion-item label="O que é o FineBase?" dense>
                  <div class="help-item-body">
                    O FineBase é uma aplicação web de gestão financeira pessoal, desenvolvida para uso individual e familiar.
                    Permite registrar gastos, entradas, parcelamentos e gastos recorrentes, além de visualizar análises e gráficos do seu fluxo financeiro.
                    <br><br>
                    O app está em fase <strong>Beta</strong>. Funcionalidades podem ser alteradas, adicionadas ou removidas sem aviso prévio durante essa fase.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Contato e suporte" dense>
                  <div class="help-item-body">
                    Para dúvidas, problemas técnicos ou sugestões, entre em contato pelo e-mail:
                    <br><br>
                    <strong>suporte@finebase.app</strong>
                    <br><br>
                    Respondemos em até <strong>3 dias úteis</strong>. Ao entrar em contato, descreva detalhadamente o problema encontrado (tela, ação realizada, mensagem de erro, se houver).
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- Termos de Uso -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="gavel" size="16px" />
                Termos de Uso
              </div>
              <q-list class="help-list">
                <q-expansion-item label="Aceitação dos termos" dense>
                  <div class="help-item-body">
                    Ao criar uma conta e utilizar o FineBase, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize o serviço.
                    Estes termos podem ser atualizados periodicamente. Você será notificado de alterações relevantes.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Uso permitido" dense>
                  <div class="help-item-body">
                    O FineBase é destinado exclusivamente ao controle financeiro pessoal e familiar. É proibido:
                    <br><br>
                    • Utilizar o serviço para fins comerciais sem autorização expressa
                    <br>• Tentar acessar dados de outros usuários
                    <br>• Realizar engenharia reversa, copiar ou redistribuir o software
                    <br>• Inserir dados falsos com intuito de prejudicar o sistema
                    <br>• Usar bots ou scripts automatizados para acessar o serviço
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Responsabilidade sobre os dados" dense>
                  <div class="help-item-body">
                    Você é o único responsável pelos dados financeiros que insere no FineBase. O app não se conecta automaticamente a bancos ou instituições financeiras — todos os dados são inseridos manualmente ou via importação de arquivos CSV gerados pelo próprio usuário.
                    <br><br>
                    O FineBase não oferece aconselhamento financeiro. As informações exibidas são baseadas exclusivamente nos dados que você cadastrou.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Disponibilidade do serviço" dense>
                  <div class="help-item-body">
                    O FineBase é fornecido "como está", sem garantia de disponibilidade ininterrupta.
                    Podemos realizar manutenções programadas ou emergenciais sem aviso prévio.
                    Não nos responsabilizamos por perdas decorrentes de indisponibilidade temporária do serviço.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Cancelamento de conta" dense>
                  <div class="help-item-body">
                    Você pode solicitar a exclusão da sua conta e todos os dados associados a qualquer momento pelo e-mail de suporte.
                    Após a exclusão, os dados são removidos de forma permanente e irreversível em até <strong>30 dias</strong>.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- Privacidade -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="lock_outline" size="16px" />
                Política de Privacidade
              </div>
              <q-list class="help-list">
                <q-expansion-item label="Quais dados coletamos" dense>
                  <div class="help-item-body">
                    <strong>Dados de cadastro:</strong> e-mail e senha (armazenados com criptografia).
                    <br><br>
                    <strong>Dados financeiros:</strong> gastos, entradas, categorias, valores e datas inseridos por você. Esses dados são armazenados associados à sua conta e visíveis apenas para você.
                    <br><br>
                    <strong>Dados técnicos:</strong> logs de acesso (data, hora, IP) para fins de segurança e diagnóstico. Não coletamos cookies de rastreamento nem vendemos dados a terceiros.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Como usamos seus dados" dense>
                  <div class="help-item-body">
                    Seus dados são utilizados exclusivamente para:
                    <br><br>
                    • Exibir suas informações financeiras na plataforma
                    <br>• Calcular resumos, gráficos e análises personalizadas
                    <br>• Garantir a segurança da sua conta (autenticação, prevenção de fraudes)
                    <br>• Melhorar o funcionamento do serviço (logs técnicos agregados, sem identificação pessoal)
                    <br><br>
                    <strong>Não</strong> compartilhamos seus dados financeiros com terceiros, anunciantes ou parceiros comerciais.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Armazenamento e segurança" dense>
                  <div class="help-item-body">
                    Os dados são armazenados no <strong>Supabase</strong> (PostgreSQL na nuvem), com as seguintes proteções:
                    <br><br>
                    • Criptografia em trânsito (HTTPS/TLS)
                    <br>• Senhas armazenadas com hash seguro (nunca em texto puro)
                    <br>• Row-Level Security (RLS): cada usuário acessa apenas seus próprios dados
                    <br>• Backups automáticos diários
                    <br><br>
                    Apesar das medidas de segurança, nenhum sistema é 100% inviolável. Em caso de incidente de segurança que afete seus dados, você será notificado por e-mail.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Retenção e exclusão de dados" dense>
                  <div class="help-item-body">
                    Seus dados ficam armazenados enquanto sua conta estiver ativa.
                    Ao solicitar exclusão da conta, todos os dados pessoais e financeiros são removidos permanentemente em até <strong>30 dias</strong>.
                    Logs técnicos anonimizados podem ser retidos por até 90 dias para fins de segurança.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- LGPD -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="verified_user" size="16px" />
                Seus Direitos — LGPD
              </div>
              <q-list class="help-list">
                <q-expansion-item label="O que é a LGPD?" dense>
                  <div class="help-item-body">
                    A <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong> é a legislação brasileira que regula o tratamento de dados pessoais.
                    O FineBase está comprometido com o cumprimento da LGPD.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Seus direitos como titular dos dados" dense>
                  <div class="help-item-body">
                    De acordo com a LGPD, você tem direito a:
                    <br><br>
                    • <strong>Acesso:</strong> solicitar uma cópia de todos os dados que armazenamos sobre você
                    <br>• <strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados
                    <br>• <strong>Exclusão:</strong> solicitar a remoção dos seus dados pessoais
                    <br>• <strong>Portabilidade:</strong> receber seus dados em formato estruturado (CSV/JSON) para migração
                    <br>• <strong>Oposição:</strong> opor-se a qualquer tratamento de dados realizado sem sua autorização
                    <br>• <strong>Revogação:</strong> retirar o consentimento a qualquer momento
                    <br><br>
                    Para exercer qualquer desses direitos, envie um e-mail para <strong>privacidade@finebase.app</strong> com o assunto "LGPD — [seu direito]".
                    Respondemos em até <strong>15 dias</strong>, conforme previsto em lei.
                  </div>
                </q-expansion-item>
                <q-expansion-item label="Base legal para tratamento dos dados" dense>
                  <div class="help-item-body">
                    O FineBase trata seus dados com base nas seguintes hipóteses legais previstas na LGPD:
                    <br><br>
                    • <strong>Execução de contrato</strong> (Art. 7º, V): dados necessários para fornecer o serviço contratado
                    <br>• <strong>Legítimo interesse</strong> (Art. 7º, IX): logs de segurança e prevenção de fraudes
                    <br>• <strong>Consentimento</strong> (Art. 7º, I): comunicações e funcionalidades opcionais
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

            <!-- Cookies -->
            <div class="help-section">
              <div class="help-section__title">
                <q-icon name="cookie" size="16px" />
                Cookies e Armazenamento Local
              </div>
              <q-list class="help-list">
                <q-expansion-item label="O que armazenamos no seu navegador" dense>
                  <div class="help-item-body">
                    O FineBase utiliza <strong>localStorage</strong> do navegador para:
                    <br><br>
                    • Manter sua sessão autenticada (token de acesso)
                    <br>• Salvar preferência de tema (claro/escuro)
                    <br><br>
                    <strong>Não utilizamos</strong> cookies de rastreamento, analytics de terceiros ou pixels de publicidade.
                    Nenhum dado financeiro é armazenado no navegador — tudo fica no servidor.
                  </div>
                </q-expansion-item>
              </q-list>
            </div>

          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Dark, useQuasar } from 'quasar'
import { useFinanceStore } from './stores/financeStore'
import { useAuthStore } from './stores/authStore'
import { onAuthStateChange } from './services/authService'
import BudgetDialog from './components/BudgetDialog.vue'
import SearchDialog from './components/SearchDialog.vue'

const route = useRoute()
const router = useRouter()
const finance = useFinanceStore()
const auth = useAuthStore()
const $q = useQuasar()

const isPublicRoute = computed(() => !!route.meta?.guestOnly)

const isMini = ref(false)
const isDark = ref(false)
const helpOpen = ref(false)
const supportOpen = ref(false)
const budgetOpen = ref(false)
const searchOpen = ref(false)

provide('openBudgetDialog', () => { budgetOpen.value = true })

watch(() => finance.error, (err) => {
  if (err) {
    $q.notify({ type: 'negative', message: err, timeout: 5000, position: 'top' })
  }
})

function handleSearchShortcut(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}

const PAGE_NAMES = {
  dashboard:  'Dashboard',
  expenses:   'Gastos',
  incomes:    'Entradas',
  recurring:  'Recorrentes',
  'monthly-closing': 'Fechamento mensal',
  score: 'Score',
  profile: 'Perfil',
}

async function handleLogout() {
  await auth.logout()
  finance.clearData()
  router.push('/portal')
}

const currentPageName = computed(() => PAGE_NAMES[route.name] || 'FineBase')

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear  = now.getFullYear()
const currentMonthYearLabel = `${now
  .toLocaleString('pt-BR', { month: 'short' })
  .replace('.', '')
  .toUpperCase()} · ${String(currentYear).slice(-2)}`

const currentMonthBalance  = computed(() => finance.balance(currentMonth, currentYear))
const currentMonthIncomes  = computed(() => finance.monthlyIncomesTotal(currentMonth, currentYear))
const currentMonthExpenses = computed(() => finance.monthlyExpensesTotal(currentMonth, currentYear))

const navItems = computed(() => [
  { to: '/dashboard',  icon: 'dashboard',    label: 'Dashboard' },
  {
    to: '/gastos',
    icon: 'trending_down',
    label: 'Gastos',
    count: finance.expenses.length || undefined,
  },
  {
    to: '/entradas',
    icon: 'trending_up',
    label: 'Entradas',
    count: finance.incomes.length || undefined,
  },
  {
    to: '/recorrentes',
    icon: 'repeat',
    label: 'Recorrentes',
    count: finance.recurringTemplates.length || undefined,
  },
  {
    to: '/fechamento-mensal',
    icon: 'fact_check',
    label: 'Fechamento mensal',
  },
])

function compactMoney(value) {
  const n = Number(value || 0)
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function toggleTheme() {
  isDark.value = !isDark.value
  Dark.set(isDark.value)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('fb-theme', isDark.value ? 'dark' : 'light')
}

let authSubscription = null

onMounted(() => {
  document.documentElement.classList.add('v-obsidian')
  const saved = localStorage.getItem('fb-theme')
  if (saved === 'dark') {
    isDark.value = true
    Dark.set(true)
    document.documentElement.classList.add('dark')
  }

  window.addEventListener('keydown', handleSearchShortcut)

  // Listen for Supabase auth state changes (handles Google OAuth callback etc.)
  authSubscription = onAuthStateChange((_event, session) => {
    auth.setSession(session)
    if (_event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    if (_event === 'SIGNED_OUT') {
      finance.clearData()
      router.push('/portal')
    } else if (_event === 'SIGNED_IN' && session) {
      finance.loadData()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleSearchShortcut)
  authSubscription?.unsubscribe()
})
</script>

<style scoped>
.app-init {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg, #f1f5f9);
}

.app-layout { overflow: hidden; }

/* Header */
.app-header {
  background: var(--header-bg) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  box-shadow: none !important;
  color: var(--text) !important;
}

/* Drawer */
.app-drawer {
  background: var(--sidebar-bg) !important;
  border-right: 1px solid var(--sidebar-border) !important;
  box-shadow: none !important;
}
.app-layout :deep(.q-drawer) {
  position: fixed !important;
  top: 0; bottom: 0; z-index: 2000;
}
.app-layout :deep(.q-drawer__content) {
  position: fixed !important;
  top: 0; bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.app-page-container { background: var(--bg); overflow: auto; }

/* ── Header content ────────────────────────────────────── */
.app-menu-btn { color: var(--text-3) !important; }

.app-breadcrumbs {
  display: flex; align-items: center; gap: 8px; font-size: 13px;
}
.crumb-root  { color: var(--text-3); }
.crumb-sep   { color: var(--text-4); }
.crumb-now   { color: var(--text); font-weight: 500; }

.app-header-right { display: flex; align-items: center; gap: 8px; }

.app-search {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-3);
  font-size: 13px;
  width: 200px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.12s, background 0.12s;

  &:hover {
    border-color: var(--accent);
    background: var(--bg-soft);
  }
}
.app-search kbd {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-4);
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-2);
}

.app-icon-btn { color: var(--text-3) !important; }

.app-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-fg);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
  font-family: var(--font-mono);
  flex-shrink: 0;
  cursor: pointer;
  transition: opacity 0.12s;
}
.app-avatar:hover { opacity: 0.85; }

/* ── Sidebar ───────────────────────────────────────────── */
.side-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 10px 16px;
}
.side-brand--mini { justify-content: center; padding: 14px 0 16px; }

.side-logo {
  width: 22px; height: 22px;
  border-radius: 5px;
  background: var(--text);
  color: var(--bg);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 10px;
  font-family: var(--font-mono);
  letter-spacing: 0;
  flex-shrink: 0;
}
.side-brand-name {
  font-weight: 600; font-size: 13px;
  color: var(--text); letter-spacing: var(--letter-tight); line-height: 1.2;
}
.side-brand-sub { font-size: 11px; color: var(--text-3); line-height: 1.2; }

.side-group-label {
  padding: 0 14px 4px;
  font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-3); font-weight: 500; margin-top: 8px;
}

.side-nav { display: flex; flex-direction: column; gap: 1px; padding: 0 6px; }

.side-item {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 8px;
  border-radius: var(--r-md);
  color: var(--text-2);
  font-size: 14px; font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  background: transparent; border: 0;
  text-align: left; width: 100%;
  letter-spacing: var(--letter-tight);
  transition: background .12s, color .12s;
}
.side-item:hover   { background: var(--bg-soft); color: var(--text); }
.side-item.is-active { background: var(--bg-soft); color: var(--text); }
.side-item-icon { color: var(--text-3); flex-shrink: 0; }
.side-item.is-active .side-item-icon { color: var(--accent); }
.side-item-label { flex: 1; }
.side-item-count {
  font-family: var(--font-mono); font-size: 10.5px;
  color: var(--text-4);
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
}

.side-balance {
  border-top: 1px dashed var(--border);
  padding: 12px 14px 16px;
  margin: 0 6px 0;
}
.side-balance-header {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-3);
  margin-bottom: 6px;
}
.side-balance-row {
  display: flex; align-items: baseline; justify-content: space-between;
  padding: 3px 0; font-size: 13px;
}
.side-balance-row .lbl { color: var(--text-3); }
.side-balance-row .val { font-weight: 500; font-family: var(--font-mono); font-size: 12px; }
.side-balance-row .pos { color: var(--pos); }
.side-balance-row .neg { color: var(--neg); }
.side-balance-row.total {
  border-top: 1px dashed var(--border);
  margin-top: 6px; padding-top: 8px;
}
.side-balance-row.total .lbl { color: var(--text-2); font-weight: 500; }
.side-balance-row.total .val { font-weight: 600; font-size: 13px; }

.side-balance-mini {
  margin: 0 6px;
  padding: 7px 8px;
  display: flex;
}

.side-group-label--bottom {
  margin-top: auto;
  padding-top: 12px;
}

.side-nav--bottom {
  padding: 0 6px;
  padding-bottom: 4px;
}

.side-item--logout .side-item-icon { color: var(--neg) !important; opacity: 0.7; }
.side-item--logout { color: var(--neg) !important; opacity: 0.7; }
.side-item--logout:hover { opacity: 1; background: rgba(220,38,38,.08) !important; }

/* ── Help dialog ───────────────────────────────────────── */
.help-dialog {
  background: var(--bg) !important;
  display: flex;
  flex-direction: column;
  max-width: 860px;
  margin: 0 auto;
}
.help-toolbar {
  background: var(--surface) !important;
  border-bottom: 1px solid var(--border);
  color: var(--text) !important;
  min-height: 52px;
  flex-shrink: 0;
}
.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.help-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 780px;
  margin: 0 auto;
}
.help-intro {
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.help-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.help-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border-soft);
}
.help-list {
  padding: 4px 0;
}
.help-list :deep(.q-expansion-item__container) {
  border-bottom: 1px solid var(--border-soft);
}
.help-list :deep(.q-expansion-item__container:last-child) {
  border-bottom: none;
}
.help-list :deep(.q-item) {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text-2);
}
.help-item-body {
  padding: 10px 16px 14px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-3);
  border-top: 1px solid var(--border-soft);
}
.help-item-body strong {
  color: var(--text-2);
  font-weight: 600;
}
.help-item-body code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg-soft);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--accent);
}

/* ── Avatar dropdown menu ──────────────────────────────── */
.avatar-menu { background: var(--surface) !important; border: 1px solid var(--border) !important; border-radius: 10px !important; box-shadow: 0 8px 24px rgba(0,0,0,.12) !important; }
.avatar-menu-item { padding: 6px 12px !important; min-height: 36px !important; border-radius: 6px !important; margin: 0 4px !important; }
.avatar-menu-item:hover { background: var(--bg-soft) !important; }
.avatar-menu-item--danger { color: #dc2626 !important; }
.avatar-menu-item--danger .q-icon { color: #dc2626 !important; }
.avatar-menu-item--danger:hover { background: rgba(220,38,38,.08) !important; }
</style>

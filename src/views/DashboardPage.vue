<template>
  <ion-page>
    <FinanceHeader title="Visão geral" />
    <ion-content class="page-content">
      <main class="page-shell">
        <section class="welcome-row">
          <div>
            <span class="page-eyebrow">Seu panorama financeiro!</span>
            <h1 class="page-heading">Tudo em equilíbrio.</h1>
            <p class="page-description">Acompanhe o que entra, o que sai e os próximos passos.</p>
          </div>
          <div class="date-pill"><ion-icon :icon="calendarOutline" /> {{ currentMonth }}</div>
        </section>

        <div v-if="loading" class="loading-state"><ion-spinner name="crescent" /></div>

        <ion-note v-if="errorMessage" color="danger" class="feedback">
          {{ errorMessage }}
        </ion-note>

        <template v-if="!loading && !errorMessage">
          <ion-grid class="dashboard-grid">
            <ion-row class="summary-row">
              <ion-col size="12" size-sm="6" size-lg="4">
                <SummaryCard
                  title="Total de receitas"
                  :value="summary.totalIncome"
                  :icon="trendingUpOutline"
                  color="success"
                />
              </ion-col>
              <ion-col size="12" size-sm="6" size-lg="4">
                <SummaryCard
                  title="Total de despesas"
                  :value="summary.totalExpense"
                  :icon="trendingDownOutline"
                  color="danger"
                />
              </ion-col>
              <ion-col size="12" size-sm="6" size-lg="4">
                <SummaryCard title="Saldo atual" :value="summary.balance" :icon="walletOutline" color="primary" />
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="12" size-lg="6">
                <ExpenseChart :categories="categories" />
              </ion-col>
              <ion-col size="12" size-lg="6">
                <MonthlyChart :months="months" />
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="12" size-sm="6" size-lg="4">
                <ion-card class="indicator-card">
                  <ion-card-content>
                    <span class="indicator-label">MAIOR CATEGORIA DE GASTO</span>
                    <ion-text class="indicator-value">
                      {{ largestCategory?.categoria ?? 'Sem despesas registradas' }}
                    </ion-text>
                    <ion-text v-if="largestCategory" color="medium">
                      {{ formatarMoeda(largestCategory.valor) }}
                    </ion-text>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="6" size-lg="4">
                <ion-card class="indicator-card">
                  <ion-card-content>
                    <span class="indicator-label">ATIVIDADE</span>
                    <ion-text color="medium">Lançamentos no período</ion-text>
                    <ion-text class="indicator-value">{{ summary.transactionCount }}</ion-text>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12" size-sm="6" size-lg="4">
                <ion-card class="indicator-card">
                  <ion-card-content>
                    <span class="indicator-label">ÍNDICE DE GASTOS</span>
                    <ion-text color="medium">Despesas sobre receitas</ion-text>
                    <ion-text class="indicator-value">
                      {{ summary.expensePercentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%
                    </ion-text>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonIcon,
  IonGrid,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  onIonViewDidEnter,
  onIonViewWillEnter,
} from '@ionic/vue';
import { calendarOutline, trendingDownOutline, trendingUpOutline, walletOutline } from 'ionicons/icons';

import ExpenseChart from '@/components/ExpenseChart.vue';
import FinanceHeader from '@/components/FinanceHeader.vue';
import MonthlyChart from '@/components/MonthlyChart.vue';
import SummaryCard from '@/components/SummaryCard.vue';
import { obterDespesasPorCategoria, obterResumoFinanceiro, obterComparativoMensal } from '@/service/dashboardService';

interface ExpenseCategory {
  categoria: string;
  valor: number;
}

interface MonthlyComparison {
  mes: string;
  receitas: number;
  despesas: number;
}

const loading = ref(true);
const errorMessage = ref('');
const chartsReady = ref(false);
const pageEntered = ref(false);
const summary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  transactionCount: 0,
  expensePercentage: 0,
});
const categories = ref<ExpenseCategory[]>([]);
const months = ref<MonthlyComparison[]>([]);
const currentMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

const largestCategory = computed(() =>
  categories.value.reduce<ExpenseCategory | null>(
    (largest, category) => (!largest || category.valor > largest.valor ? category : largest),
    null,
  ),
);

function formatarMoeda(value: number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function exibirGraficosAposLayout() {
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  if (pageEntered.value && !loading.value) {
    chartsReady.value = true;
  }
}

async function carregarPainel() {
  loading.value = true;
  errorMessage.value = '';
  chartsReady.value = false;

  try {
    const [financialSummary, expenseCategories, monthlyComparison] = await Promise.all([
      obterResumoFinanceiro(),
      obterDespesasPorCategoria(),
      obterComparativoMensal(),
    ]);

    summary.value = financialSummary;
    categories.value = expenseCategories;
    months.value = monthlyComparison;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar o painel.';
  } finally {
    loading.value = false;
    await exibirGraficosAposLayout();
  }
}

onIonViewWillEnter(() => {
  pageEntered.value = false;
  void carregarPainel();
});

onIonViewDidEnter(() => {
  pageEntered.value = true;
  void exibirGraficosAposLayout();
});
</script>

<style scoped>
.feedback {
  display: block;
  margin: 1rem 0;
}

.welcome-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.date-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 15px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: #fff;
  color: var(--app-ink);
  font-size: 0.86rem;
  font-weight: 600;
  text-transform: capitalize;
}

.date-pill ion-icon {
  color: var(--app-green);
}

.dashboard-grid {
  padding: 0;
}

.dashboard-grid ion-row {
  margin: 0 -10px;
}

.dashboard-grid ion-col {
  padding: 10px;
}

.loading-state {
  display: grid;
  min-height: 220px;
  place-items: center;
}

.indicator-card {
  height: 100%;
}

.indicator-label {
  display: block;
  margin-bottom: 13px;
  color: var(--app-green);
  font-size: 0.65rem;
  font-weight: 750;
  letter-spacing: 0.1em;
}

.indicator-value {
  display: block;
  margin-top: 0.75rem;
  font-size: 1.35rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .welcome-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

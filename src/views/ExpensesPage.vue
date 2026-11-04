<template>
  <ion-page>
    <FinanceHeader title="Despesas" />
    <ion-content class="page-content">
      <main class="page-shell">
        <section class="list-heading">
          <div>
            <span class="page-eyebrow">Saídas</span>
            <h1 class="page-heading">Despesas</h1>
            <p class="page-description">Veja para onde seu dinheiro está indo.</p>
          </div>
          <ion-button class="add-button" @click="abrirFormularioNovo">
            <ion-icon slot="start" :icon="addOutline" />
            Nova despesa
          </ion-button>
        </section>

        <div v-if="loading" class="loading-state"><ion-spinner name="crescent" /></div>
        <ion-note v-if="errorMessage" color="danger" class="feedback">
          {{ errorMessage }}
        </ion-note>

        <ion-list v-if="!loading && expenses.length" class="transaction-list">
          <TransactionItem
            v-for="expense in expensesWithIds"
            :key="expense.id"
            :transaction="expense"
            type="despesa"
            @edit="abrirFormularioEdicao"
            @delete="confirmarExclusao"
          />
        </ion-list>
        <div v-else-if="!loading" class="empty-state">
          <span class="empty-icon"><ion-icon :icon="receiptOutline" /></span>
          <h2>Nenhuma despesa por aqui</h2>
          <p>Adicione sua primeira despesa para começar a acompanhar seus gastos.</p>
          <ion-button fill="outline" @click="abrirFormularioNovo">Adicionar despesa</ion-button>
        </div>

        <ion-modal :is-open="isFormOpen" @did-dismiss="fecharFormulario">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingId ? 'Editar despesa' : 'Nova despesa' }}</ion-title>
              <ion-button slot="end" fill="clear" @click="fecharFormulario">Fechar</ion-button>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <ion-input v-model="form.descricao" label="Descrição" label-placement="stacked" :maxlength="100" />
            </ion-item>
            <ion-item>
              <ion-input
                v-model="form.valor"
                type="number"
                min="0"
                step="0.01"
                label="Valor (R$)"
                label-placement="stacked"
              />
            </ion-item>
            <ion-item>
              <ion-select v-model="form.categoria" label="Categoria" label-placement="stacked" interface="popover">
                <ion-select-option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-input v-model="form.data" type="date" label="Data" label-placement="stacked" />
            </ion-item>
            <ion-note v-if="formError" color="danger" class="feedback">{{ formError }}</ion-note>
            <ion-button expand="block" class="ion-margin-top" :disabled="saving" @click="salvarDespesa">
              <ion-spinner v-if="saving" name="crescent" />
              <ion-text v-else>Salvar despesa</ion-text>
            </ion-button>
          </ion-content>
        </ion-modal>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  alertController,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
} from '@ionic/vue';
import { addOutline, receiptOutline } from 'ionicons/icons';

import FinanceHeader from '@/components/FinanceHeader.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import { criarDespesa, excluirDespesa, listarDespesas, atualizarDespesa, type Expense } from '@/service/expenseService';

const categories = ['Alimentação', 'Transporte', 'Moradia', 'Educação', 'Lazer', 'Saúde', 'Outros'];
const expenses = ref<Expense[]>([]);
const loading = ref(true);
const saving = ref(false);
const isFormOpen = ref(false);
const editingId = ref<string | null>(null);
const errorMessage = ref('');
const formError = ref('');
const form = reactive<{ descricao: string; valor: string | number; categoria: string; data: string }>({
  descricao: '',
  valor: '',
  categoria: '',
  data: '',
});

const expensesWithIds = computed(() =>
  expenses.value.filter((expense): expense is Expense & { id: string } => Boolean(expense.id)),
);

function dataLocalDeHoje() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

async function carregarDespesas() {
  errorMessage.value = '';
  loading.value = true;
  try {
    expenses.value = await listarDespesas();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar as despesas.';
  } finally {
    loading.value = false;
  }
}

function limparFormulario() {
  form.descricao = '';
  form.valor = '';
  form.categoria = '';
  form.data = dataLocalDeHoje();
  formError.value = '';
}

function abrirFormularioNovo() {
  editingId.value = null;
  limparFormulario();
  isFormOpen.value = true;
}

function abrirFormularioEdicao(expense: Expense & { id: string }) {
  editingId.value = expense.id;
  form.descricao = expense.descricao;
  form.valor = Number(expense.valor);
  form.categoria = expense.categoria;
  form.data = expense.data;
  formError.value = '';
  isFormOpen.value = true;
}

function fecharFormulario() {
  isFormOpen.value = false;
}

async function salvarDespesa() {
  const amount = Number(form.valor);
  if (!form.descricao.trim() || !Number.isFinite(amount) || amount <= 0 || !form.data) {
    formError.value = 'Preencha a descrição, um valor maior que zero e a data.';
    return;
  }
  if (!categories.includes(form.categoria)) {
    formError.value = 'Selecione uma categoria válida.';
    return;
  }

  saving.value = true;
  formError.value = '';
  try {
    const expense = {
      descricao: form.descricao.trim(),
      valor: amount,
      categoria: form.categoria,
      data: form.data,
    };

    if (editingId.value) {
      await atualizarDespesa(editingId.value, expense);
    } else {
      await criarDespesa(expense);
    }

    fecharFormulario();
    await carregarDespesas();
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Não foi possível salvar a despesa.';
  } finally {
    saving.value = false;
  }
}

async function confirmarExclusao(id: string) {
  const alert = await alertController.create({
    header: 'Excluir despesa?',
    message: 'Esta ação não pode ser desfeita.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Excluir', role: 'confirm' },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();

  if (role !== 'confirm') return;

  errorMessage.value = '';
  loading.value = true;
  try {
    await excluirDespesa(id);
    await carregarDespesas();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível excluir a despesa.';
    loading.value = false;
  }
}

onIonViewWillEnter(carregarDespesas);
</script>

<style scoped>
.list-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.add-button {
  --padding-start: 18px;
  --padding-end: 18px;
  min-height: 46px;
}

.loading-state {
  display: grid;
  min-height: 220px;
  place-items: center;
}

.transaction-list {
  overflow: hidden;
  padding: 8px 20px;
  border: 1px solid var(--app-border);
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--app-shadow);
}

.empty-state {
  display: flex;
  min-height: 300px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 32px;
  border: 1px dashed #d9e0d9;
  border-radius: 20px;
  background: rgb(255 255 255 / 65%);
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 18px;
  background: var(--app-green-soft);
  color: var(--app-green);
  font-size: 1.5rem;
}

.empty-state h2 {
  margin: 18px 0 6px;
  color: var(--app-ink);
  font-size: 1.15rem;
}

.empty-state p {
  max-width: 360px;
  margin: 0 0 18px;
  color: var(--app-muted);
  line-height: 1.55;
}

@media (max-width: 640px) {
  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

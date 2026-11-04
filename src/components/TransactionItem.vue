<template>
  <ion-item class="transaction-item">
    <ion-label>
      <ion-text class="transaction-description">{{ transaction.descricao }}</ion-text>

      <span class="transaction-meta">
        <span class="category-pill">{{ transaction.categoria }}</span>
        <span>{{ formattedDate }}</span>
      </span>
    </ion-label>

    <ion-note slot="end" :class="['transaction-amount', type]">
      {{ formattedValue }}
    </ion-note>

    <ion-buttons slot="end">
      <ion-button fill="clear" @click="emit('edit', transaction)">
        <ion-icon :icon="pencilOutline" />
      </ion-button>

      <ion-button fill="clear" color="danger" @click="emit('delete', transaction.id)">
        <ion-icon :icon="trashOutline" />
      </ion-button>
    </ion-buttons>
  </ion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { IonItem, IonLabel, IonText, IonNote, IonButtons, IonButton, IonIcon } from '@ionic/vue';

import { pencilOutline, trashOutline } from 'ionicons/icons';

interface Transaction {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
}

const props = defineProps<{
  transaction: Transaction;
  type: 'receita' | 'despesa';
}>();

const emit = defineEmits<{
  edit: [transaction: Transaction];
  delete: [id: string];
}>();

const formattedValue = computed(() => {
  return Number(props.transaction.valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
});

const formattedDate = computed(() => {
  const date = new Date(`${props.transaction.data}T00:00:00`);

  return Number.isNaN(date.getTime()) ? props.transaction.data : date.toLocaleDateString('pt-BR');
});
</script>

<style scoped>
.transaction-item {
  --min-height: 76px;
  --padding-start: 4px;
  --inner-padding-end: 4px;
}

.transaction-description {
  display: block;
  margin-bottom: 8px;
  color: var(--app-ink);
  font-weight: 600;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--app-muted);
  font-size: 0.78rem;
}

.category-pill {
  padding: 4px 9px;
  border-radius: 999px;
  background: #f0f3ef;
  color: #53625a;
  font-weight: 550;
}

.transaction-amount {
  margin-inline: 8px 14px;
  font-size: 0.92rem;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-amount.receita {
  color: var(--ion-color-success);
}

.transaction-amount.despesa {
  color: var(--ion-color-danger);
}

@media (max-width: 520px) {
  .transaction-item {
    --inner-padding-end: 0;
  }

  .transaction-amount {
    margin-inline: 2px 6px;
    font-size: 0.78rem;
  }
}
</style>

<template>
  <ion-card class="summary-card" :class="`summary-${color}`">
    <ion-card-content>
      <ion-grid class="summary-grid">
        <ion-row class="ion-align-items-center">
          <ion-col>
            <ion-label class="summary-title">{{ title }}</ion-label>
            <ion-text class="summary-value">{{ formattedValue }}</ion-text>
          </ion-col>

          <ion-col size="auto">
            <span class="summary-icon"><ion-icon :icon="icon" /></span>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonText, IonLabel, IonIcon } from '@ionic/vue';

interface Props {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const props = defineProps<Props>();

const formattedValue = computed(() => {
  return props.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
});
</script>

<style scoped>
.summary-card {
  min-height: 154px;
  overflow: hidden;
}

.summary-card.summary-primary {
  border-color: var(--app-green);
  background: var(--app-green);
}

.summary-card.summary-primary .summary-title,
.summary-card.summary-primary .summary-value {
  color: #fff;
}

.summary-card.summary-primary .summary-icon {
  background: rgb(255 255 255 / 14%);
  color: #fff;
}

.summary-grid {
  padding: 0;
}

.summary-title {
  color: var(--app-muted);
  font-size: 0.88rem;
  font-weight: 550;
}

.summary-value {
  display: block;
  margin-top: 14px;
  color: var(--app-ink);
  font-size: clamp(1.45rem, 2.4vw, 1.9rem);
  font-weight: 720;
  letter-spacing: -0.055em;
}

.summary-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 14px;
  background: var(--app-green-soft);
  color: var(--app-green);
  font-size: 1.25rem;
}
</style>

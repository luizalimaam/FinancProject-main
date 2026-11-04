<template>
  <ion-page>
    <FinanceHeader title="Perfil" />
    <ion-content class="page-content">
      <main class="page-shell">
        <section class="profile-heading">
          <span class="page-eyebrow">Preferências</span>
          <h1 class="page-heading">Sua conta</h1>
          <p class="page-description">Gerencie seus dados e acesso ao Nexo.</p>
        </section>
        <div v-if="loading" class="loading-state"><ion-spinner name="crescent" /></div>
        <ion-note v-if="errorMessage" color="danger" class="feedback">
          {{ errorMessage }}
        </ion-note>

        <ion-card v-if="!loading && user" class="profile-card">
          <ion-card-header>
            <div class="avatar-mark">{{ user.email?.charAt(0).toUpperCase() ?? 'N' }}</div>
            <ion-card-title>Informações da conta</ion-card-title>
            <ion-card-subtitle>Seus dados de acesso ao Nexo.</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label>
                <ion-text color="medium">E-mail</ion-text>
                <ion-note>{{ user.email }}</ion-note>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <ion-text color="medium">Conta criada em</ion-text>
                <ion-note>{{ formattedCreatedAt }}</ion-note>
              </ion-label>
            </ion-item>
            <ion-button
              expand="block"
              color="danger"
              class="ion-margin-top"
              :disabled="loggingOut"
              @click="encerrarSessao"
            >
              <ion-spinner v-if="loggingOut" name="crescent" />
              <ion-text v-else>Sair da conta</ion-text>
            </ion-button>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  onIonViewWillEnter,
} from '@ionic/vue';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'vue-router';

import FinanceHeader from '@/components/FinanceHeader.vue';
import { usarAutenticacao } from '@/service/userAuth';

const { obterUsuario, sairDaConta } = usarAutenticacao();
const user = ref<User | null>(null);
const loading = ref(true);
const loggingOut = ref(false);
const errorMessage = ref('');
const router = useRouter();

const formattedCreatedAt = computed(() => {
  if (!user.value?.created_at) return 'Não disponível';
  return new Date(user.value.created_at).toLocaleDateString('pt-BR');
});

async function carregarPerfil() {
  loading.value = true;
  errorMessage.value = '';

  try {
    user.value = await obterUsuario();
    if (!user.value) {
      await router.replace('/login');
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar os dados da conta.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(carregarPerfil);

async function encerrarSessao() {
  errorMessage.value = '';
  loggingOut.value = true;
  try {
    await sairDaConta();
    await router.replace('/login');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.';
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
.profile-heading {
  margin-bottom: 28px;
}

.profile-card {
  max-width: 680px;
}

.profile-card ion-card-header {
  position: relative;
  padding-top: 92px;
}

.avatar-mark {
  position: absolute;
  top: 24px;
  left: 24px;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 18px;
  background: var(--app-green-soft);
  color: var(--app-green);
  font-size: 1.35rem;
  font-weight: 700;
}

.profile-card ion-item {
  --padding-start: 0;
  margin-top: 8px;
}

.profile-card ion-label ion-note {
  display: block;
  margin-top: 6px;
  color: var(--app-ink);
  font-size: 0.94rem;
}

.loading-state {
  display: grid;
  min-height: 220px;
  place-items: center;
}
</style>

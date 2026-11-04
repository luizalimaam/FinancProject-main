<template>
  <ion-page>
    <ion-content class="auth-content">
      <ion-grid class="auth-grid">
        <ion-row class="ion-justify-content-center ion-align-items-center auth-row">
          <ion-col size="12" size-md="5" size-lg="5" class="auth-story-col">
            <section class="auth-story">
              <div class="auth-brand" aria-label="Nexo">
                <span class="brand-mark">n</span><span>nexo<span class="brand-dot">.</span></span>
              </div>
              <span class="page-eyebrow">Um novo começo</span>
              <h1>Suas finanças, no seu ritmo.</h1>
              <p>
                Crie sua conta e tenha um lugar simples para registrar receitas, despesas e acompanhar seu progresso.
              </p>
              <div class="story-signature"><span></span> Seu espaço financeiro pessoal</div>
            </section>
          </ion-col>
          <ion-col size="12" size-md="7" size-lg="5">
            <ion-card class="auth-card">
              <ion-card-header>
                <span class="page-eyebrow">Vamos começar</span>
                <ion-card-title>Criar sua conta</ion-card-title>
                <ion-card-subtitle>Informe seus dados para organizar sua vida financeira.</ion-card-subtitle>
              </ion-card-header>

              <ion-card-content>
                <ion-item>
                  <ion-input
                    v-model="email"
                    type="email"
                    label="E-mail"
                    label-placement="stacked"
                    autocomplete="email"
                    inputmode="email"
                    :disabled="loading"
                  />
                </ion-item>
                <ion-item>
                  <ion-input
                    v-model="password"
                    type="password"
                    label="Senha"
                    label-placement="stacked"
                    autocomplete="new-password"
                    :disabled="loading"
                  />
                </ion-item>
                <ion-item>
                  <ion-input
                    v-model="passwordConfirmation"
                    type="password"
                    label="Confirme a senha"
                    label-placement="stacked"
                    autocomplete="new-password"
                    :disabled="loading"
                  />
                </ion-item>

                <ion-note v-if="errorMessage" color="danger" class="feedback">
                  {{ errorMessage }}
                </ion-note>

                <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="enviarCadastro">
                  <ion-spinner v-if="loading" name="crescent" />
                  <ion-text v-else>Cadastrar</ion-text>
                </ion-button>
                <ion-button expand="block" fill="clear" router-link="/login" :disabled="loading">
                  Já tenho uma conta
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/vue';
import { useRouter } from 'vue-router';

import { usarAutenticacao } from '@/service/userAuth';

const { cadastrarUsuario, obterSessao } = usarAutenticacao();
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

async function enviarCadastro() {
  errorMessage.value = '';
  const normalizedEmail = email.value.trim();

  if (!normalizedEmail || !password.value || !passwordConfirmation.value) {
    errorMessage.value = 'Preencha todos os campos.';
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errorMessage.value = 'Informe um e-mail válido.';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As senhas não coincidem.';
    return;
  }

  loading.value = true;
  try {
    await cadastrarUsuario(normalizedEmail, password.value);
    const session = await obterSessao();

    if (session) {
      await router.push('/dashboard');
    } else {
      await router.push({
        path: '/login',
        query: { registered: '1', emailConfirmation: '1' },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('rate limit') && normalizedMessage.includes('email')) {
      errorMessage.value =
        'O Supabase atingiu o limite de envio de e-mails. Aguarde antes de tentar novamente ou configure um SMTP próprio em Authentication > SMTP Settings.';
    } else {
      errorMessage.value = message || 'Não foi possível criar a conta. Tente novamente.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-grid {
  width: min(100%, 1120px);
  min-height: 100%;
  padding: 28px;
}

.auth-row {
  min-height: calc(100vh - 56px);
}

.auth-story {
  padding: 32px 38px 32px 0;
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 90px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--app-ink);
  font-size: 1.4rem;
  font-weight: 760;
  letter-spacing: -0.07em;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 13px;
  background: var(--app-green);
  color: #fff;
  font-size: 1.25rem;
}

.brand-dot {
  color: var(--app-green);
}

.auth-story h1 {
  max-width: 470px;
  margin: 12px 0 16px;
  color: var(--app-ink);
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 720;
  letter-spacing: -0.065em;
  line-height: 1.04;
}

.auth-story p {
  max-width: 420px;
  margin: 0;
  color: var(--app-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.story-signature {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  color: var(--app-muted);
  font-size: 0.84rem;
}

.story-signature span {
  width: 22px;
  height: 2px;
  background: var(--app-green);
}

.auth-card {
  padding: 8px 0 2px;
}

.auth-card ion-card-header {
  padding: 26px 28px 12px;
}

.auth-card ion-card-content {
  padding: 16px 28px 28px;
}

.auth-card ion-item {
  --padding-start: 0;
  margin: 6px 0;
}

.feedback {
  display: block;
  margin: 1rem 0 0;
}

@media (max-width: 767px) {
  .auth-grid {
    padding: 16px;
  }

  .auth-row {
    min-height: 100%;
  }

  .auth-story-col {
    display: none;
  }

  .auth-card ion-card-header {
    padding: 24px 22px 10px;
  }

  .auth-card ion-card-content {
    padding: 14px 22px 24px;
  }
}
</style>

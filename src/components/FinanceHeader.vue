<template>
  <ion-header>
    <ion-toolbar class="brand-toolbar">
      <div class="header-inner">
        <button class="brand" type="button" aria-label="Nexo início" @click="navegarPara('/dashboard')">
          <span class="brand-mark">n</span>
          <span class="brand-name">nexo<span>.</span></span>
        </button>
        <span class="header-divider"></span>
        <span class="current-section">{{ title }}</span>
        <span class="header-spacer"></span>
        <span class="account-caption">Seu dinheiro, com clareza.</span>
      </div>
    </ion-toolbar>
    <ion-toolbar class="navigation-toolbar">
      <ion-buttons class="navigation-buttons">
        <ion-button
          v-for="item in navigation"
          :key="item.path"
          :class="{ 'navigation-active': route.path === item.path }"
          fill="clear"
          @click="navegarPara(item.path)"
        >
          <ion-icon :icon="item.icon" aria-hidden="true" />
          {{ item.label }}
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonHeader, IonIcon, IonToolbar } from '@ionic/vue';
import { homeOutline, trendingUpOutline, trendingDownOutline, personOutline } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';

defineProps<{ title: string }>();

const route = useRoute();
const router = useRouter();

const navigation = [
  { label: 'Visão geral', path: '/dashboard', icon: homeOutline },
  { label: 'Receitas', path: '/receitas', icon: trendingUpOutline },
  { label: 'Despesas', path: '/despesas', icon: trendingDownOutline },
  { label: 'Perfil', path: '/perfil', icon: personOutline },
];

function navegarPara(path: string) {
  void router.push(path);
}
</script>

<style scoped>
.brand-toolbar {
  --background: #fff;
  border-bottom: 1px solid var(--app-border);
}

.header-inner {
  display: flex;
  align-items: center;
  width: min(100% - 48px, 1240px);
  min-height: 76px;
  margin: 0 auto;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--app-ink);
  cursor: pointer;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  background: var(--app-green);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 750;
  letter-spacing: -0.07em;
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 760;
  letter-spacing: -0.07em;
}

.brand-name span {
  color: var(--app-green);
}

.header-divider {
  width: 1px;
  height: 24px;
  margin: 0 18px;
  background: var(--app-border);
}

.current-section {
  color: var(--app-muted);
  font-size: 0.9rem;
  font-weight: 550;
}

.header-spacer {
  flex: 1;
}

.account-caption {
  color: var(--app-muted);
  font-size: 0.82rem;
}

.navigation-toolbar {
  --background: #fff;
  overflow-x: auto;
  border-bottom: 1px solid var(--app-border);
}

.navigation-buttons {
  width: min(100% - 48px, 1240px);
  min-height: 54px;
  margin: 0 auto;
  flex-wrap: nowrap;
  gap: 8px;
}

.navigation-buttons ion-button {
  --padding-start: 14px;
  --padding-end: 14px;
  min-height: 38px;
  color: var(--app-muted);
  font-size: 0.88rem;
}

.navigation-buttons ion-icon {
  margin-right: 8px;
  font-size: 1rem;
}

.navigation-buttons .navigation-active {
  --background: var(--app-green-soft);
  --background-hover: var(--app-green-soft);
  --color: var(--app-green);
}

@media (max-width: 640px) {
  .header-inner,
  .navigation-buttons {
    width: calc(100% - 32px);
  }

  .header-inner {
    min-height: 66px;
  }

  .account-caption,
  .header-divider,
  .current-section {
    display: none;
  }

  .navigation-buttons {
    justify-content: space-between;
  }

  .navigation-buttons ion-button {
    --padding-start: 10px;
    --padding-end: 10px;
    font-size: 0.8rem;
  }
}
</style>

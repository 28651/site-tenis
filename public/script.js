/**
 * SneakerHub — Frontend Controller (Vanilla JavaScript)
 * Consome a API REST desenvolvida em Node.js + Express + MongoDB.
 */

// ============================================================================
// CONFIGURAÇÃO DA API
// ============================================================================
// Detecta automaticamente a URL da API tanto localmente (porta 3000, 3001, etc.) quanto na Vercel
const API_URL = window.location.origin.startsWith('http')
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

// ============================================================================
// ESTADO DA APLICAÇÃO
// ============================================================================
let todosTenis = [];
let idParaExcluir = null;
let modoEdicao = false;

// ============================================================================
// SELETORES DO DOM
// ============================================================================
const form = document.getElementById('tenis-form');
const inputId = document.getElementById('tenis-id');
const inputMarca = document.getElementById('marca');
const inputModelo = document.getElementById('modelo');
const inputPreco = document.getElementById('preco');
const inputFoto = document.getElementById('foto');

const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const btnSubmitText = document.getElementById('btn-submit-text');
const btnSubmitSpinner = document.getElementById('btn-submit-spinner');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

const imagePreview = document.getElementById('image-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');

const catalogGrid = document.getElementById('catalog-grid');
const catalogLoading = document.getElementById('catalog-loading');
const catalogEmpty = document.getElementById('catalog-empty');
const catalogSearchEmpty = document.getElementById('catalog-search-empty');
const apiErrorBanner = document.getElementById('api-error-banner');
const apiErrorMessage = document.getElementById('api-error-message');
const btnRetry = document.getElementById('btn-retry');

const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');
const filterBrand = document.getElementById('filter-brand');
const btnRefresh = document.getElementById('btn-refresh');

const totalTenisCount = document.getElementById('total-tenis-count');
const averagePrice = document.getElementById('average-price');

const apiStatusBadge = document.getElementById('api-status-badge');
const apiStatusText = document.getElementById('api-status-text');

const modalDelete = document.getElementById('modal-delete');
const deleteTenisName = document.getElementById('delete-tenis-name');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

const toastContainer = document.getElementById('toast-container');
const btnScrollForm = document.getElementById('btn-scroll-form');
const btnEmptyAdd = document.getElementById('btn-empty-add');
const btnResetFilters = document.getElementById('btn-reset-filters');

// ============================================================================
// FORMATAÇÃO E UTILITÁRIOS
// ============================================================================

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (R$ 799,90)
 * @param {number} valor 
 * @returns {string}
 */
function formatarMoeda(valor) {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Exibe notificação flutuante (Toast)
 * @param {string} mensagem 
 * @param {'success'|'error'|'info'} tipo 
 */
function exibirToast(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  const iconSvg = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  }[tipo];

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-msg">${mensagem}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

/**
 * Atualiza o indicador de status da API no cabeçalho
 * @param {'checking'|'online'|'offline'} status 
 * @param {string} texto 
 */
function setApiStatus(status, texto) {
  apiStatusBadge.className = `status-badge ${status}`;
  apiStatusText.textContent = texto;
}

// ============================================================================
// COMUNICAÇÃO COM A API (FETCH)
// ============================================================================

/**
 * Verifica a saúde da API (GET /api/health)
 */
async function testarHealthCheck() {
  setApiStatus('checking', 'Verificando API...');
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status === 'ok') {
      setApiStatus('online', 'API Online');
      return true;
    }
    throw new Error('Resposta inesperada');
  } catch (err) {
    setApiStatus('offline', 'API Offline');
    console.warn('Aviso: Endpoint /api/health indisponível:', err.message);
    return false;
  }
}

/**
 * Busca a lista de todos os tênis cadastrados (GET /api/tenis)
 */
async function carregarTenis() {
  mostrarCarregando();
  apiErrorBanner.classList.add('hidden');

  try {
    const res = await fetch(`${API_URL}/tenis`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Erro HTTP ${res.status}`);
    }

    todosTenis = Array.isArray(json.data) ? json.data : [];
    setApiStatus('online', 'API Online');
    renderizarCatalogo();
    atualizarEstatisticas();
    atualizarFiltroMarcas();
  } catch (err) {
    console.error('Erro ao buscar tênis:', err);
    setApiStatus('offline', 'API Desconectada');
    mostrarErroApi(err.message);
  }
}

/**
 * Cadastra um novo tênis (POST /api/tenis)
 * @param {Object} dados 
 */
async function cadastrarTenis(dados) {
  setFormLoading(true);
  try {
    const res = await fetch(`${API_URL}/tenis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Erro ao cadastrar tênis.');
    }

    exibirToast(`Tênis "${json.data.modelo}" cadastrado com sucesso!`, 'success');
    resetarFormulario();
    await carregarTenis();
  } catch (err) {
    exibirToast(err.message, 'error');
  } finally {
    setFormLoading(false);
  }
}

/**
 * Atualiza um tênis existente (PUT /api/tenis/:id)
 * @param {string} id 
 * @param {Object} dados 
 */
async function atualizarTenis(id, dados) {
  setFormLoading(true);
  try {
    const res = await fetch(`${API_URL}/tenis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Erro ao atualizar tênis.');
    }

    exibirToast(`Tênis "${json.data.modelo}" atualizado com sucesso!`, 'success');
    resetarFormulario();
    await carregarTenis();
  } catch (err) {
    exibirToast(err.message, 'error');
  } finally {
    setFormLoading(false);
  }
}

/**
 * Exclui um tênis pelo ID (DELETE /api/tenis/:id)
 * @param {string} id 
 */
async function excluirTenis(id) {
  try {
    const res = await fetch(`${API_URL}/tenis/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Erro ao excluir tênis.');
    }

    exibirToast('Tênis removido com sucesso!', 'success');
    fecharModalExclusao();
    await carregarTenis();
  } catch (err) {
    exibirToast(err.message, 'error');
  }
}

// ============================================================================
// RENDERIZAÇÃO DA INTERFACE
// ============================================================================

/**
 * Renderiza os cards de produtos com suporte a busca e filtros
 */
function renderizarCatalogo() {
  catalogLoading.classList.add('hidden');
  catalogEmpty.classList.add('hidden');
  catalogSearchEmpty.classList.add('hidden');
  catalogGrid.classList.add('hidden');

  if (todosTenis.length === 0) {
    catalogEmpty.classList.remove('hidden');
    return;
  }

  const termoBusca = searchInput.value.trim().toLowerCase();
  const marcaFiltro = filterBrand.value.trim().toLowerCase();

  const filtrados = todosTenis.filter((t) => {
    const matchMarca = !marcaFiltro || t.marca.toLowerCase() === marcaFiltro;
    const matchBusca = !termoBusca || 
      t.marca.toLowerCase().includes(termoBusca) || 
      t.modelo.toLowerCase().includes(termoBusca);
    return matchMarca && matchBusca;
  });

  if (filtrados.length === 0) {
    catalogSearchEmpty.classList.remove('hidden');
    return;
  }

  catalogGrid.innerHTML = '';
  filtrados.forEach((tenis) => {
    const card = criarCardTenis(tenis);
    catalogGrid.appendChild(card);
  });

  catalogGrid.classList.remove('hidden');
}

/**
 * Cria o elemento DOM para o card de um tênis
 * @param {Object} tenis 
 * @returns {HTMLElement}
 */
function criarCardTenis(tenis) {
  const card = document.createElement('article');
  card.className = 'tenis-card';
  card.id = `tenis-${tenis._id}`;

  // Foto com fallback seguro caso a URL quebre
  const fotoFallback = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

  card.innerHTML = `
    <div class="card-image-wrapper">
      <span class="card-brand-badge">${escapeHtml(tenis.marca)}</span>
      <img 
        src="${escapeHtml(tenis.foto)}" 
        alt="${escapeHtml(tenis.marca)} ${escapeHtml(tenis.modelo)}"
        class="card-image"
        loading="lazy"
        onerror="this.onerror=null; this.src='${fotoFallback}';"
      >
    </div>
    <div class="card-body">
      <h3 class="card-modelo">${escapeHtml(tenis.modelo)}</h3>
      <div class="card-price-container">
        <span class="card-price-label">Preço:</span>
        <span class="card-price">${formatarMoeda(tenis.preco)}</span>
      </div>
      <div class="card-actions">
        <button type="button" class="btn btn-card-edit" data-id="${tenis._id}" title="Editar informações">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Editar
        </button>
        <button type="button" class="btn btn-card-delete" data-id="${tenis._id}" title="Excluir produto">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Excluir
        </button>
      </div>
    </div>
  `;

  // Event Listeners dos botões de ação do card
  const btnEdit = card.querySelector('.btn-card-edit');
  const btnDelete = card.querySelector('.btn-card-delete');

  btnEdit.addEventListener('click', () => carregarParaEdicao(tenis));
  btnDelete.addEventListener('click', () => abrirModalExclusao(tenis));

  return card;
}

/**
 * Previne ataques XSS escapando HTML em saídas de texto
 */
function escapeHtml(texto) {
  if (!texto) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Atualiza o seletor dropdown de marcas
 */
function atualizarFiltroMarcas() {
  const marcaAtual = filterBrand.value;
  const marcasUnicas = [...new Set(todosTenis.map((t) => t.marca))].sort();

  filterBrand.innerHTML = '<option value="">Todas as marcas</option>';
  marcasUnicas.forEach((marca) => {
    const opt = document.createElement('option');
    opt.value = marca;
    opt.textContent = marca;
    if (marca === marcaAtual) opt.selected = true;
    filterBrand.appendChild(opt);
  });
}

/**
 * Atualiza os contadores e estatísticas do hero
 */
function atualizarEstatisticas() {
  const total = todosTenis.length;
  totalTenisCount.textContent = total;

  if (total === 0) {
    averagePrice.textContent = 'R$ 0,00';
    return;
  }

  const soma = todosTenis.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
  const media = soma / total;
  averagePrice.textContent = formatarMoeda(media);
}

/**
 * Exibe animação de carregamento
 */
function mostrarCarregando() {
  catalogGrid.classList.add('hidden');
  catalogEmpty.classList.add('hidden');
  catalogSearchEmpty.classList.add('hidden');
  apiErrorBanner.classList.add('hidden');
  catalogLoading.classList.remove('hidden');
}

/**
 * Exibe o banner de erro com a mensagem retornada
 * @param {string} msg 
 */
function mostrarErroApi(msg) {
  catalogLoading.classList.add('hidden');
  catalogGrid.classList.add('hidden');
  catalogEmpty.classList.add('hidden');
  catalogSearchEmpty.classList.add('hidden');

  apiErrorMessage.textContent = msg.includes('Failed to fetch')
    ? `Não foi possível conectar ao servidor em "${API_URL}". Verifique se o backend está rodando.`
    : msg;

  apiErrorBanner.classList.remove('hidden');
}

// ============================================================================
// MANIPULAÇÃO DO FORMULÁRIO (CADASTRO / EDIÇÃO)
// ============================================================================

/**
 * Preenche o formulário para edição de um tênis
 * @param {Object} tenis 
 */
function carregarParaEdicao(tenis) {
  modoEdicao = true;
  inputId.value = tenis._id;
  inputMarca.value = tenis.marca;
  inputModelo.value = tenis.modelo;
  inputPreco.value = Number(tenis.preco).toFixed(2);
  inputFoto.value = tenis.foto;

  atualizarPreviaImagem(tenis.foto);

  formTitle.textContent = 'Editar Tênis';
  formSubtitle.textContent = `Modificando dados de: ${tenis.modelo}`;
  btnSubmitText.textContent = 'Salvar Alterações';
  btnCancelEdit.classList.remove('hidden');

  // Scroll suave até o formulário
  document.getElementById('form-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
  inputModelo.focus();
}

/**
 * Reseta o formulário para o modo de cadastro inicial
 */
function resetarFormulario() {
  modoEdicao = false;
  form.reset();
  inputId.value = '';
  limparErrosValidacao();

  formTitle.textContent = 'Cadastrar Novo Tênis';
  formSubtitle.textContent = 'Preencha os dados do modelo para adicioná-lo ao catálogo';
  btnSubmitText.textContent = 'Cadastrar Tênis';
  btnCancelEdit.classList.add('hidden');

  imagePreview.src = '';
  imagePreview.classList.add('hidden');
  previewPlaceholder.classList.remove('hidden');
}

/**
 * Atualiza o preview da foto
 * @param {string} url 
 */
function atualizarPreviaImagem(url) {
  if (!url || !url.trim().startsWith('http')) {
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
    return;
  }

  imagePreview.src = url.trim();
  imagePreview.onload = () => {
    imagePreview.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');
  };
  imagePreview.onerror = () => {
    imagePreview.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
  };
}

/**
 * Validação dos campos antes do envio
 * @returns {boolean}
 */
function validarFormulario() {
  limparErrosValidacao();
  let valido = true;

  const marca = inputMarca.value.trim();
  const modelo = inputModelo.value.trim();
  const preco = inputPreco.value.trim();
  const foto = inputFoto.value.trim();

  if (!marca) {
    mostrarErroCampo('error-marca', inputMarca, 'A marca é obrigatória.');
    valido = false;
  }

  if (!modelo) {
    mostrarErroCampo('error-modelo', inputModelo, 'O modelo é obrigatório.');
    valido = false;
  }

  const precoNum = Number(preco);
  if (!preco || isNaN(precoNum) || precoNum <= 0) {
    mostrarErroCampo('error-preco', inputPreco, 'Informe um preço válido maior que zero.');
    valido = false;
  }

  if (!foto) {
    mostrarErroCampo('error-foto', inputFoto, 'A URL da foto é obrigatória.');
    valido = false;
  } else {
    try {
      const url = new URL(foto);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        mostrarErroCampo('error-foto', inputFoto, 'A URL deve iniciar com http:// ou https://.');
        valido = false;
      }
    } catch {
      mostrarErroCampo('error-foto', inputFoto, 'Informe uma URL válida.');
      valido = false;
    }
  }

  return valido;
}

function mostrarErroCampo(spanId, inputEl, msg) {
  const span = document.getElementById(spanId);
  if (span) span.textContent = msg;
  if (inputEl) inputEl.classList.add('invalid');
}

function limparErrosValidacao() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.form-group input').forEach((el) => el.classList.remove('invalid'));
}

function setFormLoading(carregando) {
  if (carregando) {
    btnSubmitSpinner.classList.remove('hidden');
    btnSubmitText.textContent = modoEdicao ? 'Salvando...' : 'Cadastrando...';
    form.querySelector('button[type="submit"]').disabled = true;
  } else {
    btnSubmitSpinner.classList.add('hidden');
    btnSubmitText.textContent = modoEdicao ? 'Salvar Alterações' : 'Cadastrar Tênis';
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

// ============================================================================
// MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
// ============================================================================

function abrirModalExclusao(tenis) {
  idParaExcluir = tenis._id;
  deleteTenisName.textContent = `${tenis.marca} — ${tenis.modelo}`;
  modalDelete.classList.remove('hidden');
}

function fecharModalExclusao() {
  idParaExcluir = null;
  modalDelete.classList.add('hidden');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Submissão do Formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validarFormulario()) return;

  const payload = {
    marca: inputMarca.value.trim(),
    modelo: inputModelo.value.trim(),
    preco: Number(inputPreco.value),
    foto: inputFoto.value.trim(),
  };

  if (modoEdicao) {
    const id = inputId.value;
    await atualizarTenis(id, payload);
  } else {
    await cadastrarTenis(payload);
  }
});

// Cancelar Edição
btnCancelEdit.addEventListener('click', resetarFormulario);

// Input de Foto -> Live Preview
inputFoto.addEventListener('input', (e) => {
  atualizarPreviaImagem(e.target.value);
});

// Chips de sugestões rápidas
document.querySelectorAll('.preset-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    inputMarca.value = chip.dataset.marca;
    inputModelo.value = chip.dataset.modelo;
    inputPreco.value = chip.dataset.preco;
    inputFoto.value = chip.dataset.foto;
    atualizarPreviaImagem(chip.dataset.foto);
    limparErrosValidacao();
  });
});

// Busca em tempo real
searchInput.addEventListener('input', (e) => {
  if (e.target.value.trim()) {
    btnClearSearch.classList.remove('hidden');
  } else {
    btnClearSearch.classList.add('hidden');
  }
  renderizarCatalogo();
});

// Limpar busca
btnClearSearch.addEventListener('click', () => {
  searchInput.value = '';
  btnClearSearch.classList.add('hidden');
  renderizarCatalogo();
});

// Filtro por marca
filterBrand.addEventListener('change', renderizarCatalogo);

// Botão de recarregar
btnRefresh.addEventListener('click', carregarTenis);

// Botão de tentar novamente no banner de erro
btnRetry.addEventListener('click', carregarTenis);

// Ações do Modal de Exclusão
btnModalCancel.addEventListener('click', fecharModalExclusao);
btnModalConfirm.addEventListener('click', () => {
  if (idParaExcluir) {
    excluirTenis(idParaExcluir);
  }
});

// Fechar modal ao clicar fora
modalDelete.addEventListener('click', (e) => {
  if (e.target === modalDelete) fecharModalExclusao();
});

// Atalho para cadastrar tênis pelo botão do navbar
btnScrollForm.addEventListener('click', () => {
  document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
  inputMarca.focus();
});

// Botão no estado vazio para focar no cadastro
btnEmptyAdd.addEventListener('click', () => {
  document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
  inputMarca.focus();
});

// Limpar filtros caso nada seja encontrado
btnResetFilters.addEventListener('click', () => {
  searchInput.value = '';
  filterBrand.value = '';
  btnClearSearch.classList.add('hidden');
  renderizarCatalogo();
});

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  testarHealthCheck();
  carregarTenis();
});

/**
 * Git na Prática | Todo List App
 * Suporta tarefas declaradas diretamente no HTML pelos alunos E tarefas via formulário
 */

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const taskCounter = document.getElementById('task-counter');
  const emptyState = document.getElementById('empty-state');
  const clearCompletedBtn = document.getElementById('clear-completed');

  const STORAGE_KEY = 'minicurso_git_dynamic_tasks';
  const COMPLETED_STATE_KEY = 'minicurso_git_completed_state';

  // Carrega status de conclusão salvo para persistir cliques
  const completedState = JSON.parse(localStorage.getItem(COMPLETED_STATE_KEY)) || {};

  // 1. Processa e "hidrata" as tarefas que os alunos escreveram diretamente no HTML
  function hydrateHtmlTasks() {
    const existingItems = Array.from(taskList.querySelectorAll('.task-item'));

    existingItems.forEach((li, index) => {
      // Cria ID único estável baseado no conteúdo ou índice
      const taskId = li.dataset.id || `html-task-${index}-${li.textContent.trim().substring(0, 15).replace(/\s+/g, '-')}`;
      li.dataset.id = taskId;

      // Restaura se já estava marcada como concluída
      if (completedState[taskId]) {
        li.classList.add('completed');
      }

      // Se o aluno não colocou o checkbox estilizado, injetamos para manter o design lindo
      if (!li.querySelector('.custom-checkbox')) {
        const authorTag = li.querySelector('.author-tag');
        const authorHtml = authorTag ? authorTag.outerHTML : (li.dataset.author ? `<span class="author-tag">@${li.dataset.author}</span>` : '');
        
        // Pega o texto da tarefa (removendo a tag de autor se já existir no textContent)
        let rawText = '';
        const taskTextEl = li.querySelector('.task-text');
        if (taskTextEl) {
          rawText = taskTextEl.textContent;
        } else {
          // Clona para pegar apenas o texto
          const clone = li.cloneNode(true);
          const aTag = clone.querySelector('.author-tag');
          if (aTag) aTag.remove();
          rawText = clone.textContent.trim();
        }

        li.innerHTML = `
          <div class="task-content">
            <div class="custom-checkbox">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="task-text">${escapeHtml(rawText)}</span>
            ${authorHtml}
          </div>
          <button class="delete-btn" title="Excluir tarefa" aria-label="Excluir">✕</button>
        `;
      }

      // Adiciona eventos aos elementos do HTML
      attachTaskEvents(li, taskId);
    });
  }

  // 2. Anexa eventos de clique (concluir e excluir)
  function attachTaskEvents(li, taskId) {
    const content = li.querySelector('.task-content');
    if (content && !content.dataset.hasListener) {
      content.dataset.hasListener = 'true';
      content.addEventListener('click', () => {
        li.classList.toggle('completed');
        completedState[taskId] = li.classList.contains('completed');
        localStorage.setItem(COMPLETED_STATE_KEY, JSON.stringify(completedState));
        updateCounter();
      });
    }

    const deleteBtn = li.querySelector('.delete-btn');
    if (deleteBtn && !deleteBtn.dataset.hasListener) {
      deleteBtn.dataset.hasListener = 'true';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        li.remove();
        delete completedState[taskId];
        localStorage.setItem(COMPLETED_STATE_KEY, JSON.stringify(completedState));

        // Se for tarefa dinâmica do localStorage, remove dela também
        let dynamicTasks = getDynamicTasks();
        dynamicTasks = dynamicTasks.filter(t => t.id !== taskId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicTasks));

        updateCounter();
      });
    }
  }

  // 3. Atualiza o contador de tarefas totais e concluídas
  function updateCounter() {
    const allTasks = taskList.querySelectorAll('.task-item');
    const total = allTasks.length;
    const completed = taskList.querySelectorAll('.task-item.completed').length;

    if (total === 0) {
      taskCounter.textContent = '0 tarefas cadastradas';
      if (clearCompletedBtn) clearCompletedBtn.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (completed > 0) {
      taskCounter.textContent = `${completed} de ${total} tarefa${total > 1 ? 's' : ''} concluída${completed > 1 ? 's' : ''}`;
      if (clearCompletedBtn) clearCompletedBtn.style.display = 'inline-block';
    } else {
      taskCounter.textContent = `${total} tarefa${total > 1 ? 's' : ''} pendente${total > 1 ? 's' : ''}`;
      if (clearCompletedBtn) clearCompletedBtn.style.display = 'none';
    }
  }

  function getDynamicTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  // 4. Carrega e exibe tarefas dinâmicas salvas na sessão anterior
  function renderDynamicTasks() {
    const dynamicTasks = getDynamicTasks();
    dynamicTasks.forEach(task => {
      createTaskElement(task.id, task.text, task.author, task.completed);
    });
  }

  // 5. Cria o elemento DOM para uma tarefa
  function createTaskElement(id, text, author, isCompleted = false) {
    const li = document.createElement('li');
    li.className = `task-item ${isCompleted ? 'completed' : ''}`;
    li.dataset.id = id;

    const authorHtml = author ? `<span class="author-tag">@${escapeHtml(author)}</span>` : '';

    li.innerHTML = `
      <div class="task-content">
        <div class="custom-checkbox">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="task-text">${escapeHtml(text)}</span>
        ${authorHtml}
      </div>
      <button class="delete-btn" title="Excluir tarefa" aria-label="Excluir">✕</button>
    `;

    attachTaskEvents(li, id);
    taskList.prepend(li);
    return li;
  }

  // 6. Adicionar tarefa pelo formulário
  function handleFormSubmit(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const newId = `dyn-${Date.now()}`;
    createTaskElement(newId, text, 'Você', false);

    // Salva no storage de tarefas dinâmicas
    const dynamic = getDynamicTasks();
    dynamic.unshift({ id: newId, text, author: 'Você', completed: false });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamic));

    taskInput.value = '';
    taskInput.focus();
    updateCounter();
  }

  // 7. Limpar concluídas
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const completedItems = taskList.querySelectorAll('.task-item.completed');
      completedItems.forEach(item => {
        const id = item.dataset.id;
        item.remove();
        delete completedState[id];
      });
      localStorage.setItem(COMPLETED_STATE_KEY, JSON.stringify(completedState));

      let dynamic = getDynamicTasks().filter(t => !completedState[t.id]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamic));

      updateCounter();
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Inicialização
  hydrateHtmlTasks();
  renderDynamicTasks();
  updateCounter();

  taskForm.addEventListener('submit', handleFormSubmit);
});

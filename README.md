# 📝 Minhas Tarefas | Oficina de Git & GitHub

Aplicação de lista de tarefas colaborativa criada para a turma praticar o fluxo de **Branches**, **Commits Semânticos** e **Pull Requests**.

---

## 🎯 Como cada aluno(a) contribui diretamente no HTML:

1. **Crie sua branch:**
   ```bash
   git checkout -b feat/tarefa-seu-nome
   ```

2. **Abra o arquivo `index.html`** e localize a lista `<ul id="task-list">`.

3. **Adicione a sua tarefa** copiando e colando o modelo abaixo com o seu nome e atividade:
   ```html
   <li class="task-item" data-author="Seu Nome">
     <span class="task-text">Descrição da sua tarefa aqui</span>
     <span class="author-tag">@SeuNome</span>
   </li>
   ```

4. **Teste no navegador:**
   Abra o `index.html` no navegador. Sua tarefa aparecerá estilizada com checkbox interativo automaticamente!

5. **Faça o commit e abra o Pull Request:**
   ```bash
   git add index.html
   git commit -m "feat: adiciona tarefa de Seu Nome"
   git push -u origin feat/tarefa-seu-nome
   ```

<h1 align="center"> Sistema de Agendamento para Manicure </h1>

<p align="center">
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-sobre-o-projeto">Sobre o Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-licença">Licença</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-49AA26?style=flat-square&labelColor=000000">
</p>

---

<p align="center">
  <img alt="Demonstração do projeto" src="Projetos para README/Agendamento-Manicure-Capa.png" width="100%">
</p>

## 🚀 Tecnologias

Esse projeto foi desenvolvido com:

- **HTML5**
- **CSS3**
- **JavaScript**

## 📌 Sobre o Projeto

Aplicação web desenvolvida para facilitar o **agendamento de horários para manicure**, oferecendo uma interface moderna, simples e intuitiva.

O sistema permite que clientes realizem agendamentos rapidamente, proporcionando uma experiência semelhante a plataformas reais de marcação de horários.

### Recursos do projeto:

- Agendamento rápido e intuitivo
- Interface responsiva
- Integração com WhatsApp
- Botão para visualizar trabalhos realizados
- Layout otimizado para celulares e computadores

## Configuração do Supabase

O Supabase armazena os preços e agendamentos. O painel de preços usa login por e-mail e senha; clientes podem criar agendamentos, mas apenas a conta administrativa pode consultar a lista. Cada combinação de data e horário só pode ser reservada uma vez.

1. Crie um projeto no Supabase e abra o **SQL Editor**.
2. Execute o arquivo `supabase-setup.sql` no Editor SQL. As políticas administrativas estão configuradas para o e-mail `jeffersontecno11@gmail.com`.
3. Em **Authentication → Users**, crie a conta administrativa. Desative o cadastro público em **Authentication → Settings**.
4. Em **Project Settings → API**, copie a Project URL e a chave `anon`/publishable para `supabase-config.js`. Nunca use a `service_role` key no site.
5. Publique os arquivos atualizados do site. As chaves públicas dependem das políticas de segurança configuradas pelo SQL. Os agendamentos ficam na tabela `bookings` no Table Editor do Supabase.

---

## 📜 Licença

Este projeto está sob a licença **MIT**.

---

<p align="center"><strong>© 2026 Jefferson Natan Borges</strong></p>
(() => {
  const $ = (s) => document.querySelector(s);
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // topo e menu
  const topo = $('#topo'), menu = $('#menu'), mb = $('#menu-bt');
  const solido = () => topo.classList.toggle('solido', scrollY > 40);
  addEventListener('scroll', solido, { passive: true }); solido();
  const abreMenu = (v) => { mb.setAttribute('aria-expanded', v); menu.hidden = !v; document.body.style.overflow = v ? 'hidden' : ''; };
  mb.addEventListener('click', () => abreMenu(menu.hidden));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => abreMenu(false)));

  // hero: a peça do quadro troca a cada 4,8 s com uma cortina de baixo para cima
  const tela = $('#tela'), quadros = [...tela.querySelectorAll('img')], leg = $('#hero-peca');
  let qi = 0;
  const troca = () => {
    if (document.hidden) return;
    const velha = quadros[qi]; qi = (qi + 1) % quadros.length; const nova = quadros[qi];
    nova.classList.add('entra'); 
    leg.classList.add('muda');
    setTimeout(() => { leg.textContent = nova.dataset.leg; leg.classList.remove('muda'); }, 450);
    setTimeout(() => { velha.classList.remove('on'); nova.classList.replace('entra', 'on'); }, 1150);
  };
  if (!reduz) setInterval(troca, 4800);

  // entradas
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('vista'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.revela').forEach((el) => io.observe(el));

  // portfólio
  const P = [
    ['pb', '042', 'Retrato clássico'], ['cor', '036', 'Deadpool e Wolverine'], ['linha', '077', 'Abelha e flores'], ['pb', '034', 'Leão e relógio'],
    ['cor', '087', 'Raiva, de Divertida-Mente'], ['linha', '008', 'Crisântemo'], ['pb', '124', 'Astronauta'], ['cor', '048', 'Pinguim surfista'],
    ['pb', '035', 'Caveira'], ['linha', '005', 'Pássaros e flores'], ['cor', '127', 'Composição a cores'], ['pb', '060', 'Leopardo e tipografia'],
    ['linha', '033', 'Jardim no braço'], ['cor', '110', 'Panda'], ['pb', '062', 'Ceifeiro e ampulheta'], ['linha', '009', 'Coração com asas'],
    ['pb', '066', 'Braço em preto e cinza'], ['cor', '046', 'Stitch, Ohana'], ['linha', '071', 'Composição botânica'], ['pb', '074', 'Vaso e flores'],
    ['cor', '038', 'Personagens de infância'], ['linha', '139', 'Leveza'], ['pb', '082', 'Ampulheta'], ['linha', '147', 'Peónia'],
    ['pb', '114', 'Sleeve em curso'], ['cor', '069', 'Caveira a cores'], ['linha', '150', 'Zebra'], ['pb', '115', 'Alice no País das Maravilhas'],
    ['linha', '016', 'Ornamental no ombro'], ['pb', '148', 'Anime'], ['linha', '026', 'Renascer'], ['linha', '072', 'Tatuagem de amigas'],
  ];
  const nomes = { cor: 'Cor', pb: 'Preto e cinza', linha: 'Linha fina' };
  const grade = $('#grade');
  grade.innerHTML = P.map(([c, n, t], i) =>
    `<li data-c="${c}"><button data-i="${i}"><img src="assets/img/p/${c}-${n}.webp" alt="${t}, ${nomes[c].toLowerCase()}" width="900" height="1125" loading="lazy"><span class="leg">${t}</span></button></li>`).join('');
  const lis = [...grade.children];
  lis.forEach((li) => io.observe(li));
  let filtro = 'todos';
  const filtra = (f) => {
    filtro = f;
    document.querySelectorAll('.filtros button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === f));
    lis.forEach((li) => { li.hidden = f !== 'todos' && li.dataset.c !== f; if (!li.hidden) li.classList.add('vista'); });
  };
  document.querySelectorAll('.filtros button').forEach((b) => b.addEventListener('click', () => filtra(b.dataset.f)));
  document.querySelectorAll('.estilo').forEach((b) => b.addEventListener('click', () => {
    filtra(b.dataset.f);
    $('.filtros').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
  }));

  // caixa
  const cx = $('#caixa'), ci = $('#caixa-img'), cl = $('#caixa-leg');
  let at = 0, origem = null;
  const visiveis = () => lis.filter((li) => !li.hidden);
  const mostra = (k) => {
    const v = visiveis(); at = (k + v.length) % v.length;
    const im = v[at].querySelector('img');
    ci.src = im.src; ci.alt = im.alt; cl.textContent = v[at].querySelector('.leg').textContent;
  };
  grade.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    origem = b; mostra(visiveis().indexOf(b.parentElement));
    cx.hidden = false; document.body.style.overflow = 'hidden'; $('#caixa-fecha').focus();
  });
  const fecha = () => { cx.hidden = true; document.body.style.overflow = ''; if (origem) origem.focus(); };
  $('#caixa-fecha').addEventListener('click', fecha);
  $('#caixa-ant').addEventListener('click', () => mostra(at - 1));
  $('#caixa-prox').addEventListener('click', () => mostra(at + 1));
  cx.addEventListener('click', (e) => { if (e.target === cx || e.target.tagName === 'FIGURE') fecha(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) abreMenu(false);
    if (cx.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowLeft') mostra(at - 1);
    if (e.key === 'ArrowRight') mostra(at + 1);
  });
  let x0 = null;
  cx.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  cx.addEventListener('touchend', (e) => {
    if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(d) > 50) mostra(at + (d < 0 ? 1 : -1));
  });

  // vídeos só tocam quando aparecem
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; const p = v.play(); if (p) p.catch(() => {}); }
    else v.pause();
  }), { threshold: 0.35 });
  document.querySelectorAll('.video video').forEach((v) => vio.observe(v));
})();

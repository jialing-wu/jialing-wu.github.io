/* Keyword field — progressive enhancement for the hero.
   The markup is a plain <ul> of keyword labels. On a wide pointer device we
   hand each <li> to Matter.js and let them fall past the bio and settle on
   the shelf at the bottom of the hero. Everywhere else the <ul> stays a
   static tag cloud, which is what search engines and screen readers see. */
(function () {
  var stage = document.querySelector('.hero.kw-stage');
  if (!stage || typeof Matter === 'undefined') return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(max-width: 768px)').matches) return;

  var Engine = Matter.Engine, Bodies = Matter.Bodies, Body = Matter.Body,
      Composite = Matter.Composite, Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint, Runner = Matter.Runner;

  var items = [].slice.call(stage.querySelectorAll('.kw-list li'));
  if (!items.length) return;

  var engine = Engine.create();
  engine.gravity.y = 0.7;                 // paper, not rubber
  var runner = Runner.create();
  var bodies = [], walls = [], running = false, raf = null, lastW = 0;

  function buildWalls() {
    walls.forEach(function (w) { Composite.remove(engine.world, w); });
    var W = stage.clientWidth, H = stage.clientHeight, T = 200;
    walls = [
      Bodies.rectangle(W / 2, H + T / 2, W * 2, T, { isStatic: true }),   // floor
      Bodies.rectangle(-T / 2 + 24, H / 2, T, H * 4, { isStatic: true }),      // left
      Bodies.rectangle(W + T / 2 - 24, H / 2, T, H * 4, { isStatic: true })    // right
    ];
    Composite.add(engine.world, walls);

    // the hero shrinks when the web fonts land; lift anything the moved
    // floor would otherwise have swallowed
    bodies.forEach(function (b) {
      var half = (b.bounds.max.y - b.bounds.min.y) / 2;
      if (b.position.y + half > H) {
        Body.setPosition(b, { x: b.position.x, y: H - half });
        Body.setVelocity(b, { x: 0, y: 0 });
      }
    });
  }

  function drop() {
    bodies.forEach(function (b) { Composite.remove(engine.world, b); });
    bodies = [];
    var W = stage.clientWidth;
    items.forEach(function (li, i) {
      var a = li.firstElementChild;
      var w = a.offsetWidth, h = a.offsetHeight;
      li.style.width = w + 'px';
      li.style.height = h + 'px';
      var b = Bodies.rectangle(
        w / 2 + 20 + Math.random() * Math.max(1, W - w - 40),
        -40 - i * 30 - Math.random() * 25,
        w, h,
        { chamfer: { radius: h / 2 }, restitution: 0.12, friction: 0.5,
          frictionAir: 0.02, angle: (Math.random() - 0.5) * 0.1 }
      );
      Body.setInertia(b, b.inertia * 5);   // resists tipping onto its end
      bodies.push(b);
    });
    Composite.add(engine.world, bodies);
    paint();                              // place them off-stage before frame 1
    start();
  }

  function paint() {
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i], li = items[i];
      li.style.transform = 'translate(' + (b.position.x - li.offsetWidth / 2) + 'px,' +
        (b.position.y - li.offsetHeight / 2) + 'px) rotate(' + b.angle + 'rad)';
    }
  }

  // a pill wedged on its end is unreadable — once it has come to rest,
  // ease it back toward level
  function relax() {
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i];
      if (b.speed < 0.5 && Math.abs(b.angle) > 0.28) {
        Body.setAngle(b, b.angle * 0.9);
        Body.setAngularVelocity(b, 0);
      }
    }
  }

  function sync() { relax(); paint(); raf = requestAnimationFrame(sync); }

  function start() {
    if (running) return;
    running = true;
    Runner.run(runner, engine);
    raf = requestAnimationFrame(sync);
  }
  function stop() {
    if (!running) return;
    running = false;
    Runner.stop(runner);
    cancelAnimationFrame(raf);
  }

  // go live (synchronously — this script sits at the end of <body>, so the
  // tag cloud has already been laid out and measured)
  document.documentElement.classList.add('kw-live');
  stage.classList.add('is-live');
  lastW = stage.clientWidth;
  buildWalls();
  drop();

  // drag — pointer devices only, so touch scrolling is never captured
  if (matchMedia('(pointer: fine)').matches) {
    var mouse = Mouse.create(stage);
    ['wheel', 'DOMMouseScroll'].forEach(function (ev) {
      mouse.element.removeEventListener(ev, mouse.mousewheel);
    });
    var mc = MouseConstraint.create(engine, {
      mouse: mouse, constraint: { stiffness: 0.16, damping: 0.1, render: { visible: false } }
    });
    Composite.add(engine.world, mc);
    Matter.Events.on(mc, 'startdrag', function () { stage.classList.add('dragging'); });
    Matter.Events.on(mc, 'enddrag', function () { stage.classList.remove('dragging'); });
  }

  // simulate only while the hero is on screen
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
  }, { threshold: 0.05 }).observe(stage);

  // the hero can change height after fonts and images land
  if (window.ResizeObserver) {
    var ro = null;
    new ResizeObserver(function () {
      clearTimeout(ro);
      ro = setTimeout(buildWalls, 60);
    }).observe(stage);
  }

  var rt;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var W = stage.clientWidth;
      buildWalls();
      if (Math.abs(W - lastW) > 60) { lastW = W; drop(); }  // ignore mobile toolbar resizes
    }, 200);
  });

  var btn = document.querySelector('.kw-reset');
  if (btn) btn.addEventListener('click', drop);
})();

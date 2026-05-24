    (function() {
      const canvas = document.getElementById('starfield');
      const ctx = canvas.getContext('2d');
      let stars = [], W, H;

      function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }

      function init() {
        resize();
        stars = [];
        for (let i = 0; i < 160; i++) {
          stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.2 + 0.2,
            a: Math.random(),
            speed: Math.random() * 0.3 + 0.05,
            drift: (Math.random() - 0.5) * 0.1
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 210, 255, ${s.a})`;
          ctx.fill();
          s.y += s.speed;
          s.x += s.drift;
          s.a = 0.3 + 0.7 * Math.abs(Math.sin(Date.now() * 0.0005 + s.r));
          if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
          if (s.x > W || s.x < 0) s.x = Math.random() * W;
        });
        requestAnimationFrame(draw);
      }

      window.addEventListener('resize', init);
      init();
      draw();
    })();

    window.addEventListener('scroll', () => {
      const nav = document.getElementById('navbar');
      nav.classList.toggle('scrolled', window.scrollY > 50);

      const sections = ['home','about','projects','contact'];
      let current = 'home';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
      });
      document.querySelectorAll('.nav-pill-group .nav-link').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    });

    function toggleMenu() {
      document.getElementById('mobile-menu').classList.toggle('open');
    }

    function showLoading(duration = 1000) {
      const overlay = document.getElementById('loading-overlay');
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.remove('active'), duration);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          e.target.querySelectorAll('.project-card').forEach((c, i) => {
            c.style.opacity = '0';
            c.style.transform = 'translateY(20px)';
            setTimeout(() => {
              c.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.4s ease, box-shadow 0.4s ease';
              c.style.opacity = '1';
              c.style.transform = 'translateY(0)';
            }, i * 80);
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
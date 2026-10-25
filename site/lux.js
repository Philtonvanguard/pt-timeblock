/* Vipelex Lux - monogram reveal + scroll motion.
   No dependencies, no build step. Pairs with lux.css.

   Usage:
     <div data-lux-mark></div>              inject the monogram, animate on view
     <div data-lux-mark="Spin Strategy">    ...with a custom aria-label
     <el class="lux-reveal">                fade/rise into view, auto-staggered by sibling order
*/
(function () {
  "use strict";

  var SVG = "<svg class=\"lux-mark\" viewBox=\"0 0 1000 1000\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"__LABEL__\" data-lux-anim><defs><linearGradient id=\"luxGoldGrad__U__\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"var(--lux-s1,#8A6A2F)\"/><stop offset=\".14\" stop-color=\"var(--lux-s2,#EDD9B4)\"/><stop offset=\".30\" stop-color=\"var(--lux-s3,#C4881C)\"/><stop offset=\".46\" stop-color=\"var(--lux-s4,#F3E3C0)\"/><stop offset=\".60\" stop-color=\"var(--lux-s5,#A67C3D)\"/><stop offset=\".76\" stop-color=\"var(--lux-s6,#EDD9B4)\"/><stop offset=\".88\" stop-color=\"var(--lux-s7,#B8862B)\"/><stop offset=\"1\" stop-color=\"var(--lux-s8,#6B573A)\"/></linearGradient><linearGradient id=\"luxSheenGrad__U__\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\".40\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".50\" stop-color=\"#fff\" stop-opacity=\".9\"/><stop offset=\".60\" stop-color=\"#fff\" stop-opacity=\"0\"/></linearGradient><radialGradient id=\"luxFlashGrad__U__\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".9\"/><stop offset=\".35\" stop-color=\"var(--lux-flash,#F3E3C0)\" stop-opacity=\".45\"/><stop offset=\"1\" stop-color=\"var(--lux-s3,#C4881C)\" stop-opacity=\"0\"/></radialGradient><clipPath id=\"luxClip__U__\"><path clip-rule=\"evenodd\" d=\"M776.1,0.6 L781.3,0.0 L784.2,4.0 L834.7,128.0 L865.7,186.6 L909.3,248.6 L948.3,292.2 L948.3,296.8 L908.7,339.8 L903.0,339.8 L877.2,312.9 L817.5,234.8 L784.2,177.4 L744.5,90.7 L740.0,90.7 L717.0,103.3 L665.3,135.5 L618.3,172.2 L574.6,212.4 L569.5,210.7 L531.6,163.6 L565.4,129.7 L626.3,82.7 L689.4,43.6 L776.1,0.6 Z M90.7,665.3 L95.9,664.8 L124.0,692.9 L176.8,759.5 L215.8,823.8 L253.7,906.4 L257.7,910.4 L297.9,889.8 L337.0,864.5 L381.7,830.1 L423.1,792.2 L430.5,795.1 L467.3,837.5 L467.3,841.0 L421.9,882.9 L359.9,928.8 L294.5,966.7 L223.3,1000.0 L219.3,996.0 L173.4,888.1 L147.0,836.4 L105.6,773.2 L73.5,734.2 L51.7,712.4 L51.7,707.8 L90.7,665.3 Z M297.4,230.2 L303.7,230.8 L322.0,246.8 L368.5,293.3 L333.5,349.0 L330.1,349.0 L312.9,333.0 L253.7,408.2 L222.2,442.0 L216.4,443.2 L173.4,400.1 L173.4,396.7 L237.7,322.0 L297.4,230.2 Z M779.6,560.8 L784.7,561.4 L826.6,604.5 L826.6,607.9 L770.4,669.9 L725.6,733.1 L702.6,772.1 L697.5,775.0 L633.8,717.0 L630.3,711.3 L631.5,707.8 L664.2,654.4 L667.6,654.4 L682.5,670.5 L687.1,670.5 L734.8,607.9 L779.6,560.8 Z M220.4,0.6 L230.2,2.3 L324.3,51.7 L371.4,81.5 L418.5,117.1 L463.3,157.3 L505.2,200.3 L554.5,260.0 L598.7,322.6 L602.2,322.6 L676.8,248.0 L698.6,229.6 L703.2,230.8 L757.7,317.5 L793.3,362.2 L825.5,395.5 L826.6,401.3 L824.3,404.7 L785.9,443.2 L779.0,444.3 L735.9,397.8 L687.1,334.1 L683.7,334.1 L672.8,345.0 L639.5,384.0 L637.2,390.9 L670.5,459.8 L686.6,504.6 L662.5,564.3 L631.5,625.1 L595.9,684.8 L545.4,756.0 L548.8,765.2 L585.0,801.4 L642.4,850.7 L684.8,880.6 L736.5,910.4 L741.1,910.4 L781.9,824.9 L828.9,749.1 L858.8,711.3 L903.0,664.8 L907.6,664.8 L917.3,674.5 L947.2,707.8 L947.2,712.4 L897.8,767.5 L858.8,824.9 L832.4,874.3 L775.5,1000.0 L762.9,996.6 L653.8,939.2 L580.4,886.3 L536.7,847.3 L494.8,804.2 L448.9,750.3 L399.0,680.8 L338.1,742.8 L299.1,775.0 L261.8,715.8 L229.6,671.1 L173.4,607.9 L173.4,603.3 L198.6,576.9 L215.3,560.3 L219.9,560.3 L267.5,611.4 L314.0,671.6 L358.2,622.8 L361.7,612.5 L324.9,535.6 L313.4,506.9 L313.4,497.7 L337.5,439.2 L366.2,380.6 L413.3,303.7 L454.6,248.6 L452.4,240.5 L422.5,209.5 L361.1,155.0 L312.9,120.6 L257.7,90.7 L253.7,94.7 L215.8,178.5 L169.9,254.3 L117.1,318.6 L97.0,338.7 L89.6,338.1 L51.7,293.3 L96.4,240.5 L142.4,172.8 L175.7,107.3 L217.0,4.0 L220.4,0.6 Z M498.3,302.5 L504.0,304.8 L522.4,330.1 L554.5,381.7 L553.4,387.5 L530.4,421.9 L501.1,474.2 L496.0,472.4 L444.3,385.2 L445.5,378.3 L460.4,354.2 L498.3,302.5 Z M405.3,455.2 L411.0,456.4 L435.1,501.1 L431.7,511.5 L407.0,552.2 L384.6,503.4 L405.3,455.2 Z M590.1,455.2 L595.9,457.5 L614.2,501.1 L593.0,549.9 L585.5,543.6 L563.7,503.4 L590.1,455.2 Z M497.1,532.1 L501.1,531.6 L505.2,536.7 L524.7,573.5 L554.5,619.4 L551.1,630.9 L501.1,702.6 L497.7,702.6 L490.2,694.0 L443.2,624.0 L445.5,616.0 L474.2,573.5 L497.1,532.1 Z\"/></clipPath></defs><ellipse class=\"lux-mark__flash\" cx=\"500\" cy=\"500\" rx=\"560\" ry=\"560\" fill=\"url(#luxFlashGrad__U__)\"/><g class=\"lux-mark__pieces\"><path class=\"lux-mark__piece\" fill=\"url(#luxGoldGrad__U__)\" fill-rule=\"evenodd\" style=\"--tx:72%;--ty:-95%;--rot:-14deg;--i:0\" d=\"M776.1,0.6 L781.3,0.0 L784.2,4.0 L834.7,128.0 L865.7,186.6 L909.3,248.6 L948.3,292.2 L948.3,296.8 L908.7,339.8 L903.0,339.8 L877.2,312.9 L817.5,234.8 L784.2,177.4 L744.5,90.7 L740.0,90.7 L717.0,103.3 L665.3,135.5 L618.3,172.2 L574.6,212.4 L569.5,210.7 L531.6,163.6 L565.4,129.7 L626.3,82.7 L689.4,43.6 L776.1,0.6 Z\"/><path class=\"lux-mark__piece\" fill=\"url(#luxGoldGrad__U__)\" fill-rule=\"evenodd\" style=\"--tx:-73%;--ty:90%;--rot:14deg;--i:0\" d=\"M90.7,665.3 L95.9,664.8 L124.0,692.9 L176.8,759.5 L215.8,823.8 L253.7,906.4 L257.7,910.4 L297.9,889.8 L337.0,864.5 L381.7,830.1 L423.1,792.2 L430.5,795.1 L467.3,837.5 L467.3,841.0 L421.9,882.9 L359.9,928.8 L294.5,966.7 L223.3,1000.0 L219.3,996.0 L173.4,888.1 L147.0,836.4 L105.6,773.2 L73.5,734.2 L51.7,712.4 L51.7,707.8 L90.7,665.3 Z\"/><path class=\"lux-mark__piece\" fill=\"url(#luxGoldGrad__U__)\" fill-rule=\"evenodd\" style=\"--tx:-63%;--ty:-46%;--rot:12deg;--i:1\" d=\"M297.4,230.2 L303.7,230.8 L322.0,246.8 L368.5,293.3 L333.5,349.0 L330.1,349.0 L312.9,333.0 L253.7,408.2 L222.2,442.0 L216.4,443.2 L173.4,400.1 L173.4,396.7 L237.7,322.0 L297.4,230.2 Z\"/><path class=\"lux-mark__piece\" fill=\"url(#luxGoldGrad__U__)\" fill-rule=\"evenodd\" style=\"--tx:61%;--ty:45%;--rot:-12deg;--i:1\" d=\"M779.6,560.8 L784.7,561.4 L826.6,604.5 L826.6,607.9 L770.4,669.9 L725.6,733.1 L702.6,772.1 L697.5,775.0 L633.8,717.0 L630.3,711.3 L631.5,707.8 L664.2,654.4 L667.6,654.4 L682.5,670.5 L687.1,670.5 L734.8,607.9 L779.6,560.8 Z\"/><path class=\"lux-mark__piece\" fill=\"url(#luxGoldGrad__U__)\" fill-rule=\"evenodd\" style=\"--tx:0%;--ty:0%;--rot:-6deg;--i:2\" d=\"M220.4,0.6 L230.2,2.3 L324.3,51.7 L371.4,81.5 L418.5,117.1 L463.3,157.3 L505.2,200.3 L554.5,260.0 L598.7,322.6 L602.2,322.6 L676.8,248.0 L698.6,229.6 L703.2,230.8 L757.7,317.5 L793.3,362.2 L825.5,395.5 L826.6,401.3 L824.3,404.7 L785.9,443.2 L779.0,444.3 L735.9,397.8 L687.1,334.1 L683.7,334.1 L672.8,345.0 L639.5,384.0 L637.2,390.9 L670.5,459.8 L686.6,504.6 L662.5,564.3 L631.5,625.1 L595.9,684.8 L545.4,756.0 L548.8,765.2 L585.0,801.4 L642.4,850.7 L684.8,880.6 L736.5,910.4 L741.1,910.4 L781.9,824.9 L828.9,749.1 L858.8,711.3 L903.0,664.8 L907.6,664.8 L917.3,674.5 L947.2,707.8 L947.2,712.4 L897.8,767.5 L858.8,824.9 L832.4,874.3 L775.5,1000.0 L762.9,996.6 L653.8,939.2 L580.4,886.3 L536.7,847.3 L494.8,804.2 L448.9,750.3 L399.0,680.8 L338.1,742.8 L299.1,775.0 L261.8,715.8 L229.6,671.1 L173.4,607.9 L173.4,603.3 L198.6,576.9 L215.3,560.3 L219.9,560.3 L267.5,611.4 L314.0,671.6 L358.2,622.8 L361.7,612.5 L324.9,535.6 L313.4,506.9 L313.4,497.7 L337.5,439.2 L366.2,380.6 L413.3,303.7 L454.6,248.6 L452.4,240.5 L422.5,209.5 L361.1,155.0 L312.9,120.6 L257.7,90.7 L253.7,94.7 L215.8,178.5 L169.9,254.3 L117.1,318.6 L97.0,338.7 L89.6,338.1 L51.7,293.3 L96.4,240.5 L142.4,172.8 L175.7,107.3 L217.0,4.0 L220.4,0.6 Z M498.3,302.5 L504.0,304.8 L522.4,330.1 L554.5,381.7 L553.4,387.5 L530.4,421.9 L501.1,474.2 L496.0,472.4 L444.3,385.2 L445.5,378.3 L460.4,354.2 L498.3,302.5 Z M405.3,455.2 L411.0,456.4 L435.1,501.1 L431.7,511.5 L407.0,552.2 L384.6,503.4 L405.3,455.2 Z M590.1,455.2 L595.9,457.5 L614.2,501.1 L593.0,549.9 L585.5,543.6 L563.7,503.4 L590.1,455.2 Z M497.1,532.1 L501.1,531.6 L505.2,536.7 L524.7,573.5 L554.5,619.4 L551.1,630.9 L501.1,702.6 L497.7,702.6 L490.2,694.0 L443.2,624.0 L445.5,616.0 L474.2,573.5 L497.1,532.1 Z\"/></g><g clip-path=\"url(#luxClip__U__)\"><rect class=\"lux-mark__sheen\" x=\"0\" y=\"0\" width=\"1000\" height=\"1000\" fill=\"url(#luxSheenGrad__U__)\"/></g></svg>";

  var d = document;
  // Tells lux.css that JS is alive, so .lux-reveal may safely start hidden.
  d.documentElement.classList.add("lux-js");

  var uid = 0;

  function mountMarks() {
    var hosts = d.querySelectorAll("[data-lux-mark]");
    for (var i = 0; i < hosts.length; i++) {
      var host = hosts[i];
      if (host.__luxDone) continue;
      host.__luxDone = true;
      var label = host.getAttribute("data-lux-mark") || "Vipelex";
      // Unique gradient/clip ids so several marks on one page cannot collide.
      var u = "-" + (++uid);
      host.innerHTML = SVG
        .replace(/__U__/g, u)
        .replace(/__LABEL__/g, label.replace(/[<>"&]/g, ""));
    }
  }

  // Stagger .lux-reveal siblings. Capped so long lists do not crawl in.
  function indexReveals() {
    var groups = new Map();
    var els = d.querySelectorAll(".lux-reveal");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.style.getPropertyValue("--i")) continue; // author set it, respect that
      var p = el.parentElement || d.body;
      var n = groups.get(p) || 0;
      groups.set(p, n + 1);
      el.style.setProperty("--i", Math.min(n, 6));
    }
  }

  // Reveal by sweeping, not by IntersectionObserver.
  //
  // IO only fires when an element CROSSES the threshold. Jump the scroll position
  // in one go - an anchor link, a #hash deep link, Ctrl+End, or a browser restoring
  // scroll on reload - and everything skipped over never intersects, so it stays at
  // opacity 0 forever. Hidden-by-default content that depends on that is a trap.
  //
  // A rAF-throttled sweep cannot miss: "top is above the trigger line" is true for
  // anything entering from below AND anything already scrolled past. The list shrinks
  // as elements reveal, and the listeners drop off once it is empty.
  function observe() {
    var pending = [].slice.call(d.querySelectorAll(".lux-reveal, .lux-mark[data-lux-anim]"));
    if (!pending.length) return;
    var ticking = false;

    function sweep() {
      ticking = false;
      // Trigger a little before the bottom edge, EXCEPT once the page is scrolled all
      // the way down: anything sitting in that last 8% (a footer mark, a final CTA)
      // can never rise past the early line, so it would stay hidden permanently.
      var atBottom = window.innerHeight + window.scrollY >=
                     d.documentElement.scrollHeight - 2;
      var line = atBottom ? window.innerHeight : window.innerHeight * 0.92;
      for (var i = pending.length - 1; i >= 0; i--) {
        if (pending[i].getBoundingClientRect().top < line) {
          pending[i].classList.add("is-in"); // one-shot: never re-hidden
          pending.splice(i, 1);
        }
      }
      if (!pending.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(sweep); }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    sweep();
  }

  function init() {
    mountMarks();
    indexReveals();
    observe();
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init);
  else init();

  // Exposed so pages that inject content later can re-scan.
  window.Lux = { refresh: init };
})();

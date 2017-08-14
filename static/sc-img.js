(function() {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        display: block;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        position: relative;
      }
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        animation-name: fade-in;
        animation-iteration-count: 1;
        animation-duration: 5s;
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    </style>
  `;

  const io = new IntersectionObserver(entries => {
    for(const entry of entries) {
      if(entry.isIntersecting)
        entry.target.setAttribute('full', '');
    }
  })

  customElements.define('sc-img', class ScImg extends HTMLElement {
    static get observedAttributes() {
      return ['full'];
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      io.observe(this);
    }

    disconnectedCallback() {
      io.unobserve(this);
    }

    get src() {
      return this.getAttribute('src');
    }

    get full() {
      return this.hasAttribute('full');
    }

    get loaded() {
      return this.hasAttribute('loaded');
    }

    attributeChangedCallback() {
      if(this.loaded) return;
      const img = document.createElement('img');
      img.src = this.src;
      img.onload = _ => {
        this.setAttribute('loaded', '');
        this.shadowRoot.appendChild(img);
      }
    }
  });
})();

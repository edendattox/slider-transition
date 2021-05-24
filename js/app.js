import * as PIXI from "pixi.js";

import anime1 from "../img/anime1.jpg";
import anime2 from "../img/anime2.jpg";
import anime3 from "../img/anime3.jpg";
import anime4 from "../img/anime4.jpg";
import anime5 from "../img/anime5.jpg";
import anime6 from "../img/anime6.jpg";
import anime7 from "../img/anime7.jpg";
import anime8 from "../img/anime8.jpg";
import disp from "../img/disp.jpg";

import fit from "math-fit";
import gsap from "gsap";

// loadImages

function loadImages(paths, whenLoaded) {
  const imgs = [];
  const imgO = [];
  paths.forEach(function (path) {
    const img = new Image();
    img.onload = function () {
      imgs.push(img);
      imgO.push({ path, img });
      if (imgs.length === paths.length) whenLoaded(imgO);
    };
    img.src = path;
  });
}

class sketch {
  constructor() {
    this.app = new PIXI.Application({
      backgroundColor: 0xffffff,
      resizeTo: window,
    });
    document.body.appendChild(this.app.view);

    this.margin = 50;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.width = (window.innerWidth - 2 * this.margin) / 3;
    this.height = window.innerHeight * 0.8;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.images = [
      anime1,
      anime2,
      anime3,
      anime4,
      anime5,
      anime6,
      anime7,
      anime8,
    ];
    this.wholeWidth = this.images.length * (this.width + this.margin);

    loadImages(this.images, (image) => {
      this.loadedImages = image;
      this.add();
      this.render();
      this.scrollEvent();
      this.addFilter();
    });
  }

  scrollEvent() {
    document.addEventListener("mousewheel", (e) => {
      this.scrollTarget = e.wheelDelta / 10;
    });
  }

  addFilter() {
    this.displacementSprite = PIXI.Sprite.from(disp);
    this.app.stage.addChild(this.displacementSprite);

    let target = {
      w: 512,
      h: 512,
    };
    let parent = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    let cover = fit(target, parent);

    this.displacementSprite.position.set(cover.left + 500, cover.top + 80);
    this.displacementSprite.scale.set(cover.scale, cover.scale);

    this.displacementFilter = new PIXI.filters.DisplacementFilter(
      this.displacementSprite
    );

    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;

    this.container.filters = [this.displacementFilter];
  }

  add() {
    let parent = {
      w: this.width,
      h: this.height,
    };
    this.thumbs = [];
    this.loadedImages.forEach((img, i) => {
      let texture = PIXI.Texture.from(img.img);
      const sprite = new PIXI.Sprite(texture);
      let container = new PIXI.Container();
      let spriteContainer = new PIXI.Container();

      let mask = new PIXI.Sprite(PIXI.Texture.WHITE);
      mask.width = this.width;
      mask.height = this.height;

      sprite.mask = mask;

      sprite.anchor.set(0.5);
      sprite.position.set(
        sprite.texture.orig.width / 2,
        sprite.texture.orig.height / 2
      );

      let image = {
        w: sprite.texture.orig.width,
        h: sprite.texture.orig.height,
      };

      let cover = fit(image, parent);

      spriteContainer.position.set(cover.left, cover.top);
      spriteContainer.scale.set(cover.scale, cover.scale);

      container.x = (this.margin + this.width) * i;
      container.y = this.height / 10;

      spriteContainer.addChild(sprite);
      container.interactive = true;
      container.on("mouseover", this.mouseOn);
      container.on("mouseout", this.mouseOut);
      container.addChild(spriteContainer);
      container.addChild(mask);
      this.container.addChild(container);
      this.thumbs.push(container);
    });
  }

  mouseOn(e) {
    let el = e.target.children[0].children[0];
    gsap.to(el.scale, {
      duration: 1,
      x: 2.2,
      y: 2.2,
    });
  }
  mouseOut(e) {
    let el = e.currentTarget.children[0].children[0];
    gsap.to(el.scale, {
      duration: 1,
      x: 1,
      y: 1,
    });
  }

  calcPos(scr, pos) {
    let temp =
      ((scr + pos + this.wholeWidth + this.width + this.margin) %
        this.wholeWidth) -
      this.width -
      this.margin;

    return temp;
  }

  render() {
    this.app.ticker.add(() => {
      this.app.renderer.render(this.container);

      this.direction = this.scroll > 0 ? -1 : 1;

      this.scroll -= (this.scroll - this.scrollTarget) * 0.1;
      this.scroll *= 0.9;
      this.thumbs.forEach((th) => {
        th.position.x = this.calcPos(this.scroll, th.position.x);
      });
      this.displacementFilter.scale.x =
        3 * this.direction * Math.abs(this.scroll);
    });
  }
}

new sketch();

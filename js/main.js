'use strict';

document.addEventListener('DOMContentLoaded', () => {

   //==== Модуь работы со спойлерами  start =======================================================================================================================================================================================================================
   /*
   Для родителя слойлеров пишем атрибут data-spollers
   Для заголовков слойлеров пишем атрибут data-spoller
   Если нужно включать\выключать работу спойлеров на разных размерах экранов
   пишем параметры ширины и типа брейкпоинта.
   
   Например: 
   data-spollers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
   data-spollers="768,min" - спойлеры будут работать только на экранах больше или равно 768px
   
   Если нужно что бы в блоке открывался болько один слойлер добавляем атрибут data-one-spoller
   */

   const spollersArray = document.querySelectorAll('[data-spollers]');
   if (spollersArray.length > 0) {
      // Получение обычных слойлеров
      const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
         return !item.dataset.spollers.split(",")[0];
      });
      // Инициализация обычных слойлеров
      if (spollersRegular.length > 0) {
         initSpollers(spollersRegular);
      }
      // Получение слойлеров с медиа запросами
      const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
         return item.dataset.spollers.split(",")[0];
      });
      // Инициализация слойлеров с медиа запросами
      if (spollersMedia.length > 0) {
         const breakpointsArray = [];
         spollersMedia.forEach(item => {
            const params = item.dataset.spollers;
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            breakpoint.item = item;
            breakpointsArray.push(breakpoint);
         });
         // Получаем уникальные брейкпоинты
         let mediaQueries = breakpointsArray.map(function (item) {
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
         });
         mediaQueries = mediaQueries.filter(function (item, index, self) {
            return self.indexOf(item) === index;
         });
         // Работаем с каждым брейкпоинтом
         mediaQueries.forEach(breakpoint => {
            const paramsArray = breakpoint.split(",");
            const mediaBreakpoint = paramsArray[1];
            const mediaType = paramsArray[2];
            const matchMedia = window.matchMedia(paramsArray[0]);
            // Объекты с нужными условиями
            const spollersArray = breakpointsArray.filter(function (item) {
               if (item.value === mediaBreakpoint && item.type === mediaType) {
                  return true;
               }
            });
            // Событие
            matchMedia.addEventListener("change", function () {
               initSpollers(spollersArray, matchMedia);
            });
            initSpollers(spollersArray, matchMedia);
         });
      }
      // Инициализация
      function initSpollers(spollersArray, matchMedia = false) {
         spollersArray.forEach(spollersBlock => {
            spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
            if (matchMedia.matches || !matchMedia) {
               spollersBlock.classList.add('_spoller-init');
               initSpollerBody(spollersBlock);
               spollersBlock.addEventListener("click", setSpollerAction);
            } else {
               spollersBlock.classList.remove('_spoller-init');
               initSpollerBody(spollersBlock, false);
               spollersBlock.removeEventListener("click", setSpollerAction);
            }
         });
      }
      // Работа с контентом
      function initSpollerBody(spollersBlock, hideSpollerBody = true) {
         const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
         if (spollerTitles.length > 0) {
            spollerTitles.forEach(spollerTitle => {
               if (hideSpollerBody) {
                  spollerTitle.removeAttribute('tabindex');
                  if (!spollerTitle.classList.contains('_spoller-active')) {
                     spollerTitle.nextElementSibling.hidden = true;
                  }
               } else {
                  spollerTitle.setAttribute('tabindex', '-1');
                  spollerTitle.nextElementSibling.hidden = false;
               }
            });
         }
      }
      function setSpollerAction(e) {
         const el = e.target;
         if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
            const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
            const spollersBlock = spollerTitle.closest('[data-spollers]');
            const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
            if (!spollersBlock.querySelectorAll('._slide').length) {
               if (oneSpoller && !spollerTitle.classList.contains('_spoller-active')) {
                  hideSpollersBody(spollersBlock);
               }
               spollerTitle.classList.toggle('_spoller-active');
               _slideToggle(spollerTitle.nextElementSibling, 500);
            }
            e.preventDefault();
         }
      }
      function hideSpollersBody(spollersBlock) {
         const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._spoller-active');
         if (spollerActiveTitle) {
            spollerActiveTitle.classList.remove('_spoller-active');
            _slideUp(spollerActiveTitle.nextElementSibling, 500);
         }
      }
   }

   //==== 
   //==== Вспомогательные модули плавного расскрытия и закрытия объекта ======================================================================================================================================================================
   let _slideUp = (target, duration = 500, showmore = 0) => {
      if (!target.classList.contains('_slide')) {
         target.classList.add('_slide');
         target.style.transitionProperty = 'height, margin, padding';
         target.style.transitionDuration = duration + 'ms';
         target.style.height = `${target.offsetHeight}px`;
         target.offsetHeight;
         target.style.overflow = 'hidden';
         target.style.height = showmore ? `${showmore}px` : `0px`;
         target.style.paddingTop = 0;
         target.style.paddingBottom = 0;
         target.style.marginTop = 0;
         target.style.marginBottom = 0;
         window.setTimeout(() => {
            target.hidden = !showmore ? true : false;
            !showmore ? target.style.removeProperty('height') : null;
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            !showmore ? target.style.removeProperty('overflow') : null;
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
         }, duration);
      }
   }
   let _slideDown = (target, duration = 500, showmore = 0) => {
      if (!target.classList.contains('_slide')) {
         target.classList.add('_slide');
         target.hidden = target.hidden ? false : null;
         showmore ? target.style.removeProperty('height') : null;
         let height = target.offsetHeight;
         target.style.overflow = 'hidden';
         target.style.height = showmore ? `${showmore}px` : `0px`;
         target.style.paddingTop = 0;
         target.style.paddingBottom = 0;
         target.style.marginTop = 0;
         target.style.marginBottom = 0;
         target.offsetHeight;
         target.style.transitionProperty = "height, margin, padding";
         target.style.transitionDuration = duration + 'ms';
         target.style.height = height + 'px';
         target.style.removeProperty('padding-top');
         target.style.removeProperty('padding-bottom');
         target.style.removeProperty('margin-top');
         target.style.removeProperty('margin-bottom');
         window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
         }, duration);
      }
   }
   let _slideToggle = (target, duration = 500) => {
      if (target.hidden) {
         return _slideDown(target, duration);
      } else {
         return _slideUp(target, duration);
      }
   }
   //===
   //==== Модуь работы со спойлерами  end    ===============================================================





   // Popup start ====================================================================================

   // Получение хеша в адресе сайта
   function getHash() {
      if (location.hash) { return location.hash.replace('#', ''); }
   }
   // Указание хеша в адресе сайта
   function setHash(hash) {
      history.pushState('', '', hash);
   }

   //==== Вспомогательные модули блокировки прокрутки и скочка =====
   let bodyLockStatus = true;
   let bodyLockToggle = (delay = 500) => {
      if (document.documentElement.classList.contains('lock')) {
         bodyUnlock(delay);
      } else {
         bodyLock(delay);
      }
   }
   let bodyUnlock = (delay = 500) => {
      let body = document.querySelector("body");
      if (bodyLockStatus) {
         let lock_padding = document.querySelectorAll("._lp");
         setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
               const el = lock_padding[index];
               el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            document.documentElement.classList.remove("lock");
         }, delay);
         bodyLockStatus = false;
         setTimeout(function () {
            bodyLockStatus = true;
         }, delay);
      }
   }
   let bodyLock = (delay = 500) => {
      let body = document.querySelector("body");
      if (bodyLockStatus) {
         let lock_padding = document.querySelectorAll("._lp");
         for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
         }
         body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
         document.documentElement.classList.add("lock");

         bodyLockStatus = false;
         setTimeout(function () {
            bodyLockStatus = true;
         }, delay);
      }
   }

   //==== Вспомогательные модули блокировки прокрутки и скочка   =====

   let popupItem;
   function initPopups() {
      popupItem = new HystModal({
         linkAttributeName: "data-popup",
         beforeOpen: function (popupItem) {
            const hash = popupItem.openedWindow.id;
            setHash(`#${hash}`);
         },
         afterClose: function (popupItem) {
            setHash(window.location.href.split('#')[0]);
         },
         // прочие настройки (не обязательно), см. API
      });
      // Открытие по хешу
      if (getHash() && document.querySelector(`#${getHash()}`)) {
         popupItem.open(`#${getHash()}`);
      }
   }
   initPopups();

   // Popup end =============================================================================================

   //DYNAMIC ADAPT  start ===================================================================================

   function DynamicAdapt(type) {
      this.type = type;
   }

   DynamicAdapt.prototype.init = function () {
      const _this = this;
      // массив объектов
      this.оbjects = [];
      this.daClassname = "_dynamic_adapt_";
      // массив DOM-элементов
      this.nodes = document.querySelectorAll("[data-da]");

      // наполнение оbjects объктами
      for (let i = 0; i < this.nodes.length; i++) {
         const node = this.nodes[i];
         const data = node.dataset.da.trim();
         const dataArray = data.split(",");
         const оbject = {};
         оbject.element = node;
         оbject.parent = node.parentNode;
         оbject.destination = document.querySelector(dataArray[0].trim());
         оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
         оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
         оbject.index = this.indexInParent(оbject.parent, оbject.element);
         this.оbjects.push(оbject);
      }

      this.arraySort(this.оbjects);

      // массив уникальных медиа-запросов
      this.mediaQueries = Array.prototype.map.call(this.оbjects, function (item) {
         return '(' + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
      }, this);
      this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, function (item, index, self) {
         return Array.prototype.indexOf.call(self, item) === index;
      });

      // навешивание слушателя на медиа-запрос
      // и вызов обработчика при первом запуске
      for (let i = 0; i < this.mediaQueries.length; i++) {
         const media = this.mediaQueries[i];
         const mediaSplit = String.prototype.split.call(media, ',');
         const matchMedia = window.matchMedia(mediaSplit[0]);
         const mediaBreakpoint = mediaSplit[1];

         // массив объектов с подходящим брейкпоинтом
         const оbjectsFilter = Array.prototype.filter.call(this.оbjects, function (item) {
            return item.breakpoint === mediaBreakpoint;
         });
         matchMedia.addListener(function () {
            _this.mediaHandler(matchMedia, оbjectsFilter);
         });
         this.mediaHandler(matchMedia, оbjectsFilter);
      }
   };

   DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
      if (matchMedia.matches) {
         for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.moveTo(оbject.place, оbject.element, оbject.destination);
         }
      } else {
         for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            if (оbject.element.classList.contains(this.daClassname)) {
               this.moveBack(оbject.parent, оbject.element, оbject.index);
            }
         }
      }
   };

   // Функция перемещения
   DynamicAdapt.prototype.moveTo = function (place, element, destination) {
      element.classList.add(this.daClassname);
      if (place === 'last' || place >= destination.children.length) {
         destination.insertAdjacentElement('beforeend', element);
         return;
      }
      if (place === 'first') {
         destination.insertAdjacentElement('afterbegin', element);
         return;
      }
      destination.children[place].insertAdjacentElement('beforebegin', element);
   }

   // Функция возврата
   DynamicAdapt.prototype.moveBack = function (parent, element, index) {
      element.classList.remove(this.daClassname);
      if (parent.children[index] !== undefined) {
         parent.children[index].insertAdjacentElement('beforebegin', element);
      } else {
         parent.insertAdjacentElement('beforeend', element);
      }
   }

   // Функция получения индекса внутри родителя
   DynamicAdapt.prototype.indexInParent = function (parent, element) {
      const array = Array.prototype.slice.call(parent.children);
      return Array.prototype.indexOf.call(array, element);
   };

   // Функция сортировки массива по breakpoint и place 
   // по возрастанию для this.type = min
   // по убыванию для this.type = max
   DynamicAdapt.prototype.arraySort = function (arr) {
      if (this.type === "min") {
         Array.prototype.sort.call(arr, function (a, b) {
            if (a.breakpoint === b.breakpoint) {
               if (a.place === b.place) {
                  return 0;
               }

               if (a.place === "first" || b.place === "last") {
                  return -1;
               }

               if (a.place === "last" || b.place === "first") {
                  return 1;
               }

               return a.place - b.place;
            }

            return a.breakpoint - b.breakpoint;
         });
      } else {
         Array.prototype.sort.call(arr, function (a, b) {
            if (a.breakpoint === b.breakpoint) {
               if (a.place === b.place) {
                  return 0;
               }

               if (a.place === "first" || b.place === "last") {
                  return 1;
               }

               if (a.place === "last" || b.place === "first") {
                  return -1;
               }

               return b.place - a.place;
            }

            return b.breakpoint - a.breakpoint;
         });
         return;
      }
   };

   const da = new DynamicAdapt("max");
   da.init();


   // DYNAMIC ADAPT  end =====================================================================================


   // Slider ===============================================================================================
   // Slider ===============================================================================================
   // Slider nmnmmmmmmm ===============================================================================================


   let popularSlider = null;
   let mediaQuerySize = 425;

   function popularSliderInit() {
      if (!popularSlider) {
         popularSlider = new Swiper('.popular-slider', {
            // ... ваши опции
            loop: true,
            slidesPerView: 3,
            spaceBetween: 30,
            speed: 800,
            // Navigation arrows
            navigation: {
               nextEl: '.swiper-button-next',
               prevEl: '.swiper-button-prev',
            },

            breakpoints: {
               320: {
                  // slidesPerView: 1,
                  // spaceBetween: -20,

               },
               425: {
                  slidesPerView: 1,
                  spaceBetween: 30,
               },
               768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
               },
               992: {
                  slidesPerView: 3,
                  spaceBetween: 30,
               },
            },
         });
      }
   }

   function popularSliderDestroy() {
      if (popularSlider) {
         popularSlider.destroy();
         popularSlider = null;
      }
   }

   $(window).on('load resize', function () {
      // Берём текущую ширину экрана
      var windowWidth = $(this).innerWidth();

      // Если ширина экрана меньше или равна mediaQuerySize(1024)
      if (windowWidth > mediaQuerySize) {
         // Инициализировать слайдер если он ещё не был инициализирован
         popularSliderInit()
      } else {
         // Уничтожить слайдер если он был инициализирован
         popularSliderDestroy()
      }
   });


   // Slider nmnmmmmmmm ===============================================================================================




   // Плавный скролл кнопки наверх  ====================================================
   let btnUp = document.querySelector('.btn__up');

   btnUp.addEventListener('click', function (e) {
      scrollToY(0);
   });

   let scrolls = 0;
   window.addEventListener('scroll', function (e) {
      // console.log(++scrolls);
      let pos = window.pageYOffset;

      if (pos > window.innerHeight) {
         btnUp.classList.add('btn__up-open');
      }
      else {
         btnUp.classList.remove('btn__up-open');
      }

   });

   function scrollToY(pos) {
      window.scrollTo({
         top: pos,
         behavior: "smooth"
      });
   }
   // Плавный скролл кнопки наверх  =================================================================


   // Плавный скролл к пунктам =======================================================================
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
         e.preventDefault();
         document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
         });
      });
   });
   // Плавный скролл к пунктам =========================================================================



   // Меню бургер ======================================================================================
   //Burger start   ====================================================================================
   const iconMenu = document.querySelector(".icon-menu");
   const menuBody = document.querySelector(".menu__list");
   const closeBtn = document.querySelector(".mobile__menu-clouse");
   const menuListLinkCatalog = document.querySelector(".menu__list-link-catalog");

   if (iconMenu) {
      iconMenu.addEventListener("click", function (e) {
         // document.body.classList.toggle("_lock");
         // iconMenu.classList.toggle("menu-open");
         // menuBody.classList.toggle("menu-open");
         // menuBody.classList.toggle('menu__list--active');
         // 
         document.body.classList.add("_lock");
         iconMenu.classList.add("menu-open");
         menuBody.classList.add("menu-open");
         menuBody.classList.add('menu__list--active');
      });
   }

   if (menuBody) {
      menuBody.addEventListener('click', function () {
         // iconMenu.classList.remove("menu-open");
         // menuBody.classList.remove("menu__list--active");
         // menuBody.classList.remove("menu-open");
         // document.body.classList.remove("_lock");
      });
   }

   if (closeBtn) {
      closeBtn.addEventListener('click', function () {
         // menuBody.classList.toggle("menu__list--active");
         document.body.classList.remove("_lock");
         iconMenu.classList.remove("menu-open");
         menuBody.classList.remove("menu-open");
         menuBody.classList.remove('menu__list--active');
      });
   }

   if (menuListLinkCatalog) {
      menuListLinkCatalog.addEventListener('click', function (e) {
         // e.preventDefault();
         // iconMenu.classList.add("menu-open");
         // menuBody.classList.add("menu__list--active");
         // menuBody.classList.add("menu-open");
         // document.body.classList.add("_lock");
      });
   }



   //Burger  end  ==========================================================================================

   // search ============================================================================================
   const menuListBtn = document.querySelector(".menu__list-btn");
   const menuListItems = document.querySelectorAll(".menu__list-item");
   const menuListForm = document.querySelector(".menu__list-form");
   const closeSearchHeaderBtn = document.querySelector(".close-search-header__btn");





   menuListBtn.addEventListener('click', function () {
      menuListItems.forEach(menuListItem => {
         menuListItem.classList.add('menu__list-item--delete');
      });
      menuListForm.classList.add('menu__list-form--active');
   });

   closeSearchHeaderBtn.addEventListener('click', function () {
      menuListItems.forEach(menuListItem => {
         menuListItem.classList.remove('menu__list-item--delete');
      });
      menuListForm.classList.remove('menu__list-form--active');

   });

   //search ============================================================================================

   // ==============================================================================================

   // ==============================================================================================





});

//=====  JQuery  start  =============================================================

$(document).ready(function () {
   $("form").submit(function () { // Событие отправки с формы
      var form_data = $(this).serialize(); // Собираем данные из полей
      $.ajax({
         type: "POST", // Метод отправки
         url: "send.php", // Путь к PHP обработчику sendform.php
         data: form_data,
         success: function () {
            $('.overley').addClass('overley-visible');
            $('.modal').addClass('modal__visible');
         }
      }).done(function () {
         $(this).find('input').val('');
         $('form').trigger('reset');
      });
      event.preventDefault();
   });
});


// Slick slider start ====================================================================
$(function () {
   $('.your-class').slick({
      dots: true,
   });

});

// Slick slider finish ====================================================================

//=====  JQuery  finish ===================================================================

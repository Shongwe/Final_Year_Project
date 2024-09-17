(function($) {

    "use strict";

    var searchPopup = function() {
      $('#header-nav').on('click', '.search-button', function(e) {
        $('.search-popup').toggleClass('is-visible');
      });

      $('#header-nav').on('click', '.btn-close-search', function(e) {
        $('.search-popup').toggleClass('is-visible');
      });
      
      $(".search-popup-trigger").on("click", function(b) {
          b.preventDefault();
          $(".search-popup").addClass("is-visible"),
          setTimeout(function() {
              $(".search-popup").find("#search-popup").focus()
          }, 350)
      }),
      $(".search-popup").on("click", function(b) {
          ($(b.target).is(".search-popup-close") || $(b.target).is(".search-popup-close svg") || $(b.target).is(".search-popup-close path") || $(b.target).is(".search-popup")) && (b.preventDefault(),
          $(this).removeClass("is-visible"))
      }),
      $(document).keyup(function(b) {
          "27" === b.which && $(".search-popup").removeClass("is-visible")
      })
    }

    var initProductQty = function(){

      $('.product-qty').each(function(){

        var $el_product = $(this);
        var quantity = 0;

        $el_product.find('.quantity-right-plus').click(function(e){
            e.preventDefault();
            var quantity = parseInt($el_product.find('#quantity').val());
            $el_product.find('#quantity').val(quantity + 1);
        });

        $el_product.find('.quantity-left-minus').click(function(e){
            e.preventDefault();
            var quantity = parseInt($el_product.find('#quantity').val());
            if(quantity>0){
              $el_product.find('#quantity').val(quantity - 1);
            }
        });

      });

    }

    $(document).ready(function() {

      searchPopup();
      initProductQty();

      var swiper = new Swiper(".main-swiper", {
        speed: 500,
        navigation: {
          nextEl: ".swiper-arrow-prev",
          prevEl: ".swiper-arrow-next",
        },
      });         

      var swiper = new Swiper(".product-swiper", {
        slidesPerView: 4,
        spaceBetween: 10,
        pagination: {
          el: "#mobile-products .swiper-pagination",
          clickable: true,
        },
        breakpoints: {
          0: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          980: {
            slidesPerView: 4,
            spaceBetween: 20,
          }
        },
      });      

      var swiper = new Swiper(".product-watch-swiper", {
        slidesPerView: 4,
        spaceBetween: 10,
        pagination: {
          el: "#smart-watches .swiper-pagination",
          clickable: true,
        },
        breakpoints: {
          0: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          980: {
            slidesPerView: 4,
            spaceBetween: 20,
          }
        },
      }); 

      var swiper = new Swiper(".testimonial-swiper", {
        loop: true,
        navigation: {
          nextEl: ".swiper-arrow-prev",
          prevEl: ".swiper-arrow-next",
        },
      }); 

    }); 

})(jQuery);


const products = [
  {
      image: '../images/car21.jpg',
      title: 'Dmax',
      price: 'R850 per day'
  },
  {
    image: '../images/car20.jpg',
    title: 'Vcross',
    price: 'R750 per day'
  }
];

function generateProductCards() {
  const swiperContainer = document.querySelector('.swiper-wrapper'); 

  products.forEach(product => {
      const swiperSlide = document.createElement('div');
      swiperSlide.classList.add('swiper-slide');

      const productCard = document.createElement('div');
      productCard.classList.add('product-card', 'position-relative');

      const imageHolder = document.createElement('div');
      imageHolder.classList.add('image-holder');

      const img = document.createElement('img');
      img.src = product.image;
      img.alt = 'product-item';
      img.classList.add('img-fluid');

      imageHolder.appendChild(img);

      const cartConcern = document.createElement('div');
      cartConcern.classList.add('cart-concern', 'position-absolute');

      const cartButton = document.createElement('div');
      cartButton.classList.add('cart-button', 'd-flex');

      const cartLink = document.createElement('a');
      cartLink.href = 'cart.html';
      cartLink.classList.add('btn', 'btn-medium', 'btn-black');
      cartLink.innerHTML = 'Add to Cart<svg class="cart-outline"><use xlink:href="#cart-outline"></use></svg>';

      cartButton.appendChild(cartLink);

      cartConcern.appendChild(cartButton);

      const cardDetail = document.createElement('div');
      cardDetail.classList.add('card-detail', 'd-flex', 'justify-content-between', 'pt-3');

      const cardTitle = document.createElement('h3');
      cardTitle.classList.add('card-title', 'text-uppercase');

      const titleLink = document.createElement('a');
      titleLink.href = '#';
      titleLink.textContent = product.title;

      cardTitle.appendChild(titleLink);

      const itemPrice = document.createElement('span');
      itemPrice.classList.add('item-price', 'text-primary');
      itemPrice.textContent = product.price;

      cardDetail.appendChild(cardTitle);
      cardDetail.appendChild(itemPrice);

      productCard.appendChild(imageHolder);
      productCard.appendChild(cartConcern);
      productCard.appendChild(cardDetail);

      swiperSlide.appendChild(productCard);

      swiperContainer.appendChild(swiperSlide);
  });
}

document.addEventListener('DOMContentLoaded', generateProductCards);


document.addEventListener('DOMContentLoaded', function() {
  generateProductCards();

  const swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
          el: '.swiper-pagination',
          clickable: true,
      },
      navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
      },
      breakpoints: {
          640: {
              slidesPerView: 2,
              spaceBetween: 20,
          },
          768: {
              slidesPerView: 3,
              spaceBetween: 30,
          },
          1024: {
              slidesPerView: 4,
              spaceBetween: 40,
          },
      }
  });
});

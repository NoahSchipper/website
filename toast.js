function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
          toast.classList.remove("show");
        }, 2000);
      }

      document.addEventListener("DOMContentLoaded", function () {
        // Copy email
        document
          .querySelector(".email .fa-copy")
          .addEventListener("click", function () {
            const email =
              document.querySelector(".email-address h2").textContent;
            navigator.clipboard.writeText(email);
            showToast("Email copied to clipboard!");
          });

        // Click to email
        document
          .querySelector(".email .fa-envelope")
          .addEventListener("click", function () {
            const email =
              document.querySelector(".email-address h2").textContent;
            window.location.href = `mailto:${email}`;
          });

        // Copy phone
        document
          .querySelector(".phone .fa-copy")
          .addEventListener("click", function () {
            const phone =
              document.querySelector(".phone-number h2").textContent;
            navigator.clipboard.writeText(phone);
            showToast("Phone number copied to clipboard!");
          });
      });
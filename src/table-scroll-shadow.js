(function () {
  // Define the constructor
  this.TableScrollShadow = function () {
    // Define option defaults
    let defaults = {
      wrapperClass: ".table-wrapper",
      scrollAreaClass: ".table-scroll",
      throttleDelay: 75,
      showButtons: false,
      enableLongTextCellMinWidth: false,
      longTextCellMinWidthCharacters: 80,
      buttonElement: "button",
      leftButtonClasses: ["table-scroll-button", "table-scroll-button--left"],
      rightButtonClasses: ["table-scroll-button", "table-scroll-button--right"],
      leftButtonLabel: "Scroll left",
      rightButtonLabel: "Scroll right",
    };

    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    } else {
      this.options = defaults;
    }
  };

  // Public init method
  TableScrollShadow.prototype.init = function () {
    const tables = document.querySelectorAll(this.options.wrapperClass);
    const checkForOverflow = new ResizeObserver(
      throttle((entries) => {
        for (let entry of entries) {
          const tableWrapper = entry.target;
          const scrollArea = tableWrapper.querySelector(
            this.options.scrollAreaClass
          );
          const table = tableWrapper.querySelector("table");
          let tableHasOverflow = false;

          // Override color css variable
          if (this.options.shadowColor) {
            tableWrapper.style.setProperty(
              "--table-shadow-color",
              this.options.shadowColor
            );
          }

          // Override size css variable
          if (this.options.shadowSize) {
            tableWrapper.style.setProperty(
              "--table-shadow-size",
              this.options.shadowSize
            );
          }

          if (table.clientWidth > scrollArea.clientWidth) {
            // Handle overflow
            tableHasOverflow = true;
            tableWrapper.classList.add("has-overflow");
          } else {
            tableHasOverflow = false;
            tableWrapper.classList.remove(
              "has-overflow",
              "has-shadow-left",
              "has-shadow-right"
            );
          }

          // Add long text cell min width
          if (this.options.enableLongTextCellMinWidth) {
            const cells = table.querySelectorAll("td");

            cells.forEach((cell) => {
              if (
                cell.textContent.length >=
                this.options.longTextCellMinWidthCharacters
              ) {
                cell.classList.add("long-text-cell");
              }
            });
          }

          // Add horizontal shadows
          if (tableHasOverflow) {
            tableWrapper.classList.add("has-shadow-right");

            scrollArea.addEventListener("scroll", () => {
              let scrollSize = table.clientWidth - scrollArea.clientWidth;

              if (scrollArea.scrollLeft === 0) {
                tableWrapper.classList.add("has-shadow-right");
                tableWrapper.classList.remove("has-shadow-left");
              } else if (
                scrollArea.scrollLeft > 0 &&
                scrollArea.scrollLeft !== scrollSize
              ) {
                tableWrapper.classList.add(
                  "has-shadow-right",
                  "has-shadow-left"
                );
              } else if (scrollArea.scrollLeft === scrollSize) {
                tableWrapper.classList.remove("has-shadow-right");
                tableWrapper.classList.add("has-shadow-left");
              }
            });
          }

          // Add buttons to scroll left and right
          if (this.options.showButtons) {
            let leftButton = document.createElement(this.options.buttonElement);
            let rightButton = document.createElement(
              this.options.buttonElement
            );

            leftButton.classList.add(...this.options.leftButtonClasses);
            rightButton.classList.add(...this.options.rightButtonClasses);

            leftButton.textContent = this.options.leftButtonLabel;
            rightButton.textContent = this.options.rightButtonLabel;

            tableWrapper.appendChild(leftButton);
            tableWrapper.appendChild(rightButton);

            leftButton.addEventListener("click", () => {
              scrollArea.scrollLeft = 0;
            });

            rightButton.addEventListener("click", () => {
              scrollArea.scrollLeft = scrollArea.scrollWidth;
            });
          }
        }
      }, this.options.throttleDelay)
    );

    // Observe the tables present on the page
    tables.forEach((table) => {
      checkForOverflow.observe(table);
    });
  };

  // Utility method to extend defaults with options
  const extendDefaults = (source, properties) => {
    let property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  };

  // Utility to throttle callbacks
  const throttle = (callback, delay) => {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => callback.apply(this, args), delay);
    };
  };
})();

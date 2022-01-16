'use strict';

const usersContainer = document.querySelector('.users-container');
const popupContainer = document.querySelector('.popup-container');
const sortSelection = document.querySelector('.sort-selection');

const users = [];
const getJSON = function (url, errMsg = 'Something went wrong') {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${errMsg} (${res.status})`);
    return res.json();
  });
};
const formatStr = function (str) {
  return str[0].toUpperCase() + str.slice(1);
};

class User {
  id;
  contacts = {};
  address = {};
  avatar = {};
  constructor(name, location, email, phone, picture) {
    this.titleName = name.title;
    this.firstName = name.first;
    this.lastName = name.last;
    this.contacts.street = location.street;
    this.contacts.city = location.city;
    this.contacts.state = location.state;
    this.contacts.email = email;
    this.contacts.phone = phone;
    this.avatar.large = picture.large;
    this.avatar.medium = picture.medium;
    this._setId();
  }

  get fullName() {
    return `${formatStr(this.titleName)}. ${formatStr(
      this.firstName
    )} ${formatStr(this.lastName)}`;
  }

  _setId() {
    this.id = '_' + Math.random().toString(36).substring(2, 9);
  }

  compare(anotherUser) {
    if (this.firstName < anotherUser.firstName) {
      return -1;
    }
    if (this.firstName > anotherUser.firstName) {
      return 1;
    }
    return 0;
  }
}

class App {
  constructor() {
    getJSON(
      'https://api.randomuser.me/1.0/?results=50&nat=gb,us&inc=gender,name,location,email,phone,picture'
    )
      .then((data) => {
        data.results.forEach((el) => {
          const user = new User(
            el.name,
            el.location,
            el.email,
            el.phone,
            el.picture
          );
          users.push(user);
          this._renderUsers(user);
        });
      })
      .catch((err) => console.error(err.message))
      .finally(() => {
        usersContainer.style.opacity = 1;
        sortSelection.style.opacity = 1;
      });

    usersContainer.addEventListener('click', this._renderPopup.bind(this));
    popupContainer.addEventListener('click', function (e) {
      const clicked = e.target.classList.contains('popup-container');
      if (!clicked) return;
      const popup = popupContainer.querySelector('.popup');
      popupContainer.classList.add('hidden');
      popup.remove();
    });
    sortSelection.addEventListener('change', this.sortUsers.bind(this));
  }

  _getUser(userCard) {
    return users.find((el) => el.id === userCard.dataset.id);
  }

  _renderUsers(user) {
    const html = `
      <article class="user-card" data-id="${user.id}">
            <img class="user-card_img" src="${user.avatar.medium}" alt="Avatar" />
            <h3 class="user-card_name">${user.fullName}</h3>
          </article>
      `;
    usersContainer.insertAdjacentHTML('beforeend', html);
  }

  _renderPopup(e) {
    const userCard = e.target.closest('.user-card');
    if (!userCard) return;
    const user = this._getUser(userCard);
    const html = `
<div class="popup">
          <img class="popup_img" src="${user.avatar.large}" alt="Avatar" />
          <div class="popup_data">
            <p class="popup_row"><span>Street:</span>${user.contacts.street}</p>
            <p class="popup_row"><span>City:</span>${formatStr(
              user.contacts.city
            )}</p>
            <p class="popup_row"><span>State:</span>${formatStr(
              user.contacts.state
            )}</p>
            <p class="popup_row">
              <span>Email:</span>${user.contacts.email}
            </p>
            <p class="popup_row"><span>Phone number:</span>${
              user.contacts.phone
            }</p>
          </div>
        </div>
    `;
    popupContainer.insertAdjacentHTML('beforeend', html);
    popupContainer.classList.remove('hidden');
  }

  sortUsers(e) {
    users.sort((firstUser, nextUser) => {
      return e.target.value === 'Reverse order'
        ? firstUser.compare(nextUser) * -1
        : firstUser.compare(nextUser);
    });
    usersContainer.innerHTML = '';
    users.forEach((el) => this._renderUsers(el));
  }
}

const app = new App();

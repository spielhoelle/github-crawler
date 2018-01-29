/* eslint-disable */

class ApiCall {
  constructor () {
    this.baseUrl = 'https://api.github.com/users'
    this.username = ""
  }
  getRepoList(username){
    console.log("requested repo list for: " + username)
    var url = this.baseUrl
    return new Promise(function(resolve, reject) {
      $.getJSON(`${url}/${username}/repos`)
        .done((data) => {
          resolve(data);
          localStorage.setItem('reposlist', JSON.stringify(data));
          console.log("repo list:", data)
        })
        .fail( () => {
          alert("Username not found");
        })
    })
  }
  getProfileInfo(username){
    console.log("requested user info for:" + username)
    const database = JSON.parse(localStorage.getItem('users')) || [];
    const users = database.filter(function (user) {
      return user.login == username;
    });
    if (users.length) {
      return users[0];
    } else{
      fetch(`${this.baseUrl}/${username}`)
        .then(resp => resp.json())
        .then((data) => {
          var users = JSON.parse(localStorage.getItem('users')) || []
          users.push(data);
          localStorage.setItem('users', JSON.stringify( users ));
          return data;
        })
    }
  }
  getSavedUsers(){
    if (localStorage.getItem('users') !== null) {
      // pass local storage to showSavedUsers in order to display them
      instance_of_view.showSavedUsers(JSON.parse(localStorage.getItem('users')));
    } else {
      // throw error if no local storage was found
      console.log("no storage found");
    }
  }
}
class ViewLayer {
  constructor() {
    this.elements = {
      'form': document.getElementById('github-form'),
      'username': document.getElementById('username'),
      'repo': document.getElementById('button-repo'),
      'info': document.getElementById('button-info'),
      'repo_list': document.getElementById('repo-list'),
      'image': document.getElementById('avatar'),
      'website': document.getElementById('website'),
      'created_at': document.getElementById('created_at'),
    }
    this.repoEventListener()
    this.profileInfoEventListener()
    this.onLoadListener()
  }
  showRepoList(data){
    console.log("repo list got updated")
    data.forEach(function(entry) {
      var element = document.createElement('li');
      element.classList.add('list-group-item')
      element.innerHTML = entry.name
      document.getElementById('repo-list').appendChild(element)
    });
  }
  // method to display saved github-userlist in browser
  showSavedUsers(userList){
    const list = document.querySelector(".saved_users");
    list.style.listStyle = "none";
    userList.forEach((user) => {
      const li = document.createElement("li");
      li.classList = "badge badge-pill badge-primary m-1 px-2 py-1";
      li.innerHTML = user.login;
      list.appendChild(li);
    })

  }
  // listens to pageload event
  onLoadListener(){
    var InstanceOfAPiCall = new ApiCall();
    window.addEventListener("load", () => InstanceOfAPiCall.getSavedUsers());
  }
  repoEventListener(){
    var InstanceOfAPiCall = new ApiCall();
    var updateView = this.showRepoList
    var username = this.elements.username

    this.elements.repo.addEventListener("click", function(e){
      e.preventDefault();
      InstanceOfAPiCall.getRepoList(username.value)
        .then(function(v) { // `delay` returns a promise
          updateView(v)
        });
    });
  }
  profileInfoEventListener(){
    var InstanceOfAPiCall = new ApiCall();

    var show = this.render
    const username = this.elements.username
    this.elements.info.addEventListener("click", function(e){
      e.preventDefault();
      //validation for the input value
      var letterNumber = /^[0-9a-zA-Z]+$/;
      if (letterNumber.test(username.value)){
        show(InstanceOfAPiCall.getProfileInfo(username.value))
      } else {
        username.classList.add("is-invalid");
      }
    });
  }
  render(data){
    console.log("userprofile got updated")
    instance_of_view.elements.image.src = data.avatar_url
    instance_of_view.elements.website.href = data.blog
    instance_of_view.elements.website.innerHTML = data.blog
    instance_of_view.elements.created_at.innerHTML = data.created_at
  }
}
const instance_of_view = new ViewLayer();

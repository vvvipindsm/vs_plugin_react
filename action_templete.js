export const actionTemplete = `<div id="<%= id %>" class="<%=(i % 2 == 1 ? "even" : "")%>">'
<div class="grid_1 alpha right">
  <img class="righted" src="<%= profileImageUrl %>"/>
</div>
<div class="grid_6 omega contents">
  <a href="/<%= fromUser %>"><%= fromUser %></a>
</div>
</div>
<% for (var i = 0; i < users.length; i++) { %>
<a href="<%=users[i].url%>"><%= users[i].name %></a>
<% } %>`


module.exports = {
  actionTemplete
};

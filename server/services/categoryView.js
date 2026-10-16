function categoryView(category) {
  return category ? { id: category.id, name: category.name, icon: category.icon } : null;
}

module.exports = { categoryView };

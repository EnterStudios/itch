
async function focusSearch (store, action) {
  const searchBar = document.querySelector('#search')
  if (searchBar) {
    searchBar.focus()
    searchBar.select()
  }
}

async function focusFilter (store, action) {
  const filterBar = document.querySelector('.hub-meat-tab.visible .filter-input-field')
  if (filterBar) {
    filterBar.focus()
    filterBar.select()
  }
}

async function clearFilters () {
  const filterBar = document.querySelector('.hub-meat-tab.visible .filter-input-field')
  if (filterBar) {
    filterBar.value = ''
  }
}

export default {focusSearch, focusFilter, clearFilters}

import { AbstractPaginator } from './Contracts/AbstractPaginator';

export class LengthAwarePaginator extends AbstractPaginator {
  /**
   * Create a new paginator instance.
   *
   * @param  mixed  items
   * @param  int  total
   * @param  int  perPage
   * @param  int|null  currentPage
   * @param  array  options (path, query, fragment, pageName)
   * @return void
   */
  constructor(items, total, perPage = 10, currentPage = 1, options = []) {
    super(items, perPage, currentPage);
    /**
     * The total number of items before slicing.
     *
     * @var int
     */
    this.total = total;
  }

  getTotal() {
    return this.total;
  }

  getLastPage() {
    return this.lastPage;
  }

  getTotalPages() {
    return Math.ceil(this.getTotal() / this.getPerPage());
  }

  /**
   * Get the instance as an object.
   *
   * @return object
   */
  toJson() {
    return {
      total: this.getTotal(),
      per_page: this.getPerPage(),
      current_page: this.getCurrentPage(),
      last_page: this.getLastPage(),
      total_pages: this.getTotalPages(),
      items: this.getItems()
    };
  }
}

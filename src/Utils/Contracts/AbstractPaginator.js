export class AbstractPaginator {
  /**
   * The base path to assign to all URLs.
   *
   * @var string
   */
  // path = "/";

  /**
   * The query parameters to add to all URLs.
   *
   * @var array
   */
  // query = [];

  /**
   * The URL fragment to add to all URLs.
   *
   * @var string|null
   */
  // fragment;

  /**
   * The query string variable used to store the page.
   *
   * @var string
   */
  // pageName = "page";

  constructor(items, perPage = 10, currentPage = 1) {
    /**
     * All of the items being paginated.
     *
     * @var array
     */
    this.items = items;

    /**
     * The number of items to be shown per page.
     *
     * @var int
     */
    this.perPage = perPage;

    /**
     * The current page being "viewed".
     *
     * @var int
     */
    this.currentPage = currentPage;
  }

  getItems() {
    return this.items;
  }

  setItems(items) {
    this.items = items;
    return this;
  }

  getPerPage() {
    return this.perPage;
  }

  getCurrentPage() {
    return this.currentPage;
  }
}

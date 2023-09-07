class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: { $regex: this.queryStr.keyword, $options: "i" },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryStrCopy = { ...this.queryStr };
    const removeItems = ["keyword", "page", "limit"];
    removeItems.forEach((item) => {
      delete queryStrCopy[item];
    });
    let queryString = JSON.stringify(queryStrCopy);
    queryString = queryString.replace(
      /\b(lt|gt|lte|gte)\b/g,
      (key) => `$${key}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  pagination(numberOfProductsPerPage) {
    const page = Number(this.queryStr.page) || 1;
    const skip = (page - 1) * numberOfProductsPerPage;
    this.query = this.query.find().limit(numberOfProductsPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;

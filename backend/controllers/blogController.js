const Blog = require('../models/Blog');

// Lấy tất cả blog với phân trang
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    // Remove default limit, only limit if specified
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skip = (page - 1) * (limit || 0);

    const total = await Blog.countDocuments();
    let query = Blog.find().sort({ createdAt: -1 }).skip(skip);

    if (limit) {
      query = query.limit(limit);
    }

    const blogs = await query;

    res.json({
      blogs,
      total,
      currentPage: page,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy blog theo id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm mới blog
exports.createBlog = async (req, res) => {
  try {
    const { title, summary, content, author, image, updatedAt } = req.body;
    const blog = new Blog({
      title,
      summary,
      content,
      author,
      image,
      updatedAt: updatedAt ? new Date(updatedAt) : Date.now()
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa blog theo id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật blog theo id
exports.updateBlog = async (req, res) => {
  try {
    const { title, summary, content, author, image } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        summary,
        content,
        author,
        image,
        updatedAt: new Date() // luôn cập nhật ngày hiện tại khi sửa
      },
      { new: true }
    );
    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
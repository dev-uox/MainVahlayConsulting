import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Helmet } from "react-helmet-async";
import slugify from "slugify";

const slugifyText = (text) =>
  slugify(text || "", {
    lower: true,
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    strict: true,
    trim: true,
  });


// Reusable Aside Component
function AsideContent({ categoriesWithBlogs }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Other Blogs</h2>
      {categoriesWithBlogs?.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-2">
            {cat.name}
          </h3>
          <ul className="ml-2 space-y-2">
            {cat.blogs.map((b) => (
              <li key={b.id} className="bg-slate-50 p-2 rounded-md shadow-md">
                <Link
                  to={`/blogs/${slugifyText(cat.name)}/${slugifyText(b.title)}`}
                  className="block text-xs text-gray-700 hover:underline"
                >
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const BlogDetailPage = () => {
  const { categorySlug, blogSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriesWithBlogs, setCategoriesWithBlogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const categories = [];

        for (const docSnap of catSnap.docs) {
          const cat = { id: docSnap.id, ...docSnap.data() };
          cat.slug = slugifyText(cat.name);

          const blogSnap = await getDocs(
            collection(db, "categories", cat.id, "blogs")
          );
          const blogs = blogSnap.docs.map((b) => {
            const blogData = { id: b.id, ...b.data() };
            blogData.slug = slugifyText(blogData.title);
            return blogData;
          });

          cat.blogs = blogs;
          categories.push(cat);
        }

        setCategoriesWithBlogs(categories);

        // Find the category and blog by slug
        const matchedCategory = categories.find(
          (cat) => cat.slug === categorySlug
        );

        if (!matchedCategory) {
          setBlog(null);
          setLoading(false);
          return;
        }

        const matchedBlog = matchedCategory.blogs.find(
          (b) => b.slug === blogSlug
        );

        if (!matchedBlog) {
          setBlog(null);
        } else {
          setBlog({
            ...matchedBlog,
            seoKeywords: Array.isArray(matchedBlog.seoKeywords)
              ? matchedBlog.seoKeywords
              : [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, blogSlug]);


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500 text-xl">Blog not found.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Helmet>
        <title>{blog.seoTitle || blog.title}</title>
        {blog.subtitle && (
          <meta name="description" content={blog.seoDescription} />
        )}
        {blog.seoKeywords.length > 0 && (
          <meta name="keywords" content={blog.seoKeywords.join(", ")} />
        )}
      </Helmet>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block bg-white rounded shadow-sm p-4 self-start">
          <AsideContent categoriesWithBlogs={categoriesWithBlogs} />
        </aside>

        {/* Blog Content */}
        <main className="bg-white rounded shadow-sm p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-3">
            {blog.title}
          </h1>
          {blog.subtitle && (
            <p className="text-lg text-gray-600 mb-6 italic">
              {blog.subtitle}
            </p>
          )}
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-auto object-cover rounded mb-6"
            />
          )}
          {blog.headerparagraph && (
            <p className="mb-6 text-gray-700">{blog.headerparagraph}</p>
          )}
          {blog.beforesectionparagraph && (
            <p className="mb-6 text-gray-700">
              {blog.beforesectionparagraph}
            </p>
          )}

          {/* Sections */}
          <div className="space-y-8">
            {blog.sections?.map((section, idx) => (
              <div key={idx}>
                {section.heading && (
                  <h2 className="text-xl font-semibold mb-2 text-red-800">
                    {section.heading}
                  </h2>
                )}
                {section.paragraph && (
                  <p className="mb-2 text-gray-700">{section.paragraph}</p>
                )}
                {section.bullets?.length > 0 && (
                  <ul className="list-disc list-inside mb-2 text-gray-700">
                    {section.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.paragraph2 && (
                  <p className="italic text-gray-700">{section.paragraph2}</p>
                )}
              </div>
            ))}
          </div>

          {blog.conclusion && (
            <p className="mt-6 text-gray-700">{blog.conclusion}</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default BlogDetailPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useAuth } from '../context/AuthContext';
import EditableText from '../components/EditableText';
import { FiCalendar, FiArrowRight, FiTag } from 'react-icons/fi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
};

const getMonthYear = (dateVal) => {
  if (!dateVal) return 'Uncategorized';
  try {
    const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch { return 'Uncategorized'; }
};

export default function Blog() {
  const { isAdmin } = useAuth() || {};
  const [activeMonth, setActiveMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openBlogId, setOpenBlogId] = useState(null);

  const { data: blogsRaw, loading: blogsLoading } = useFirestoreCollection('blogs', []);
  const blogs = (blogsRaw || []).filter(b => b.published);

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = blogs.filter(b => {
    const matchMonth = activeMonth === 'All' || getMonthYear(b.date) === activeMonth;
    const matchSearch = !searchQuery ||
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchSearch;
  });

  const months = ['All', ...Array.from(new Set(
    blogs.map(b => getMonthYear(b.date)).filter(m => m !== 'Uncategorized')
  ))];

  return (
    <div className="min-h-screen bg-white">

      {/* PAGE HEADER */}
      <div className="border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h1
            className="font-['Playfair_Display'] font-bold text-black leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
          >
            Blog
          </h1>
          <p className="mt-3 font-['Inter'] text-gray-500 text-base max-w-lg">
            Thoughts on leadership, strategy, and the human side of management.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-0">

          {/* MAIN LIST */}
          <main className="flex-1 min-w-0 lg:pr-12 lg:border-r border-gray-200">

            {/* Mobile search */}
            <div className="lg:hidden py-6 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search blogs..."
                className="w-full px-4 py-2.5 border border-gray-300 font-['Inter'] text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {blogsLoading ? (
              <div className="py-16 space-y-12">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse border-b border-gray-100 pb-12">
                    <div className="h-6 bg-gray-100 w-16 mb-4 rounded" />
                    <div className="flex gap-8">
                      <div className="flex-1 space-y-3">
                        <div className="h-8 bg-gray-100 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                      </div>
                      <div className="w-48 h-36 bg-gray-100 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-2xl font-['Playfair_Display'] text-gray-400 mb-2">No articles found</p>
                <p className="text-sm font-['Inter'] text-gray-400">Try adjusting your search or filter.</p>
              </div>
            ) : (
              filtered.map((blog, index) => (
                <article key={blog.id} className="py-10 border-b border-gray-200 last:border-b-0">

                  {/* Numbered title */}
                  <h3
                    className="font-['Playfair_Display'] font-bold text-black leading-tight mb-5"
                    style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.9rem)' }}
                  >
                    <span className="text-gray-300 mr-2">{index + 1}.</span>
                    {isAdmin ? (
                      <EditableText
                        collection="blogs"
                        docId={blog.id}
                        field="title"
                        defaultValue={blog.title}
                        className="font-bold"
                        multiline={false}
                        modalClassName="rounded-2xl shadow-2xl border border-gray-100 p-4 bg-white"
                      />
                    ) : (
                      <Link
                        to={`/blog/${blog.slug || blog.id}`}
                        className="hover:text-[#3333FF] transition-colors duration-200"
                      >
                        {blog.title}
                      </Link>
                    )}
                  </h3>

                  {/* Two-column: text + image */}
                  <div className="flex flex-col sm:flex-row gap-8 items-start">

                    {/* Left: excerpt + meta + CTA */}
                    <div className="flex-1 min-w-0">
                      <blockquote className="border-l-4 border-[#FF6600] pl-4 mb-5">
                        <p className="font-['Playfair_Display'] italic text-gray-600 text-base leading-relaxed line-clamp-4">
                          {isAdmin ? (
                            <EditableText
                              collection="blogs"
                              docId={blog.id}
                              field="excerpt"
                              defaultValue={blog.excerpt}
                              multiline={true}
                              className="font-['Playfair_Display'] italic text-gray-600 text-base leading-relaxed line-clamp-4"
                              modalClassName="rounded-2xl shadow-2xl border border-gray-100 p-4 bg-white"
                            />
                          ) : blog.excerpt}
                        </p>
                      </blockquote>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 mb-5 text-xs font-['Inter'] text-gray-400">
                        {blog.date && (
                          <span className="flex items-center gap-1.5">
                            <FiCalendar size={11} />
                            {formatDate(blog.date)}
                          </span>
                        )}
                        {blog.category && (
                          <span className="flex items-center gap-1.5 text-[#FF6600]">
                            <FiTag size={11} />
                            {blog.category}
                          </span>
                        )}
                      </div>

                      {/* Read Blog & Expand Description */}
                      <button
                        className={`inline-flex items-center gap-2 font-['Inter'] font-bold text-sm text-[#3333FF] group focus:outline-none ${openBlogId === blog.id ? 'underline' : ''}`}
                        onClick={() => setOpenBlogId(openBlogId === blog.id ? null : blog.id)}
                      >
                        <span className="underline underline-offset-2 hover:no-underline">Read Blog</span>
                        <FiArrowRight size={14} className={`group-hover:translate-x-1 transition-transform duration-200 ${openBlogId === blog.id ? 'rotate-90' : ''}`} />
                      </button>
                      {/* Description Expand/Collapse */}
                      <div
                        className={`overflow-hidden transition-all duration-400 ${openBlogId === blog.id ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                      >
                        {openBlogId === blog.id && (
                          <div className="bg-[#f0f1ff] rounded-lg p-5 text-gray-700 font-['Inter'] text-base shadow-sm">
                            {isAdmin ? (
                              <EditableText
                                collection="blogs"
                                docId={blog.id}
                                field="content"
                                defaultValue={blog.content}
                                multiline={true}
                                className="w-full min-h-[120px]"
                                placeholder="Enter blog content..."
                                modalClassName="rounded-2xl shadow-2xl border border-gray-100 p-4 bg-white"
                            />
                          ) : blog.content || 'No description available.'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: image */}
                    <div className="w-full sm:w-52 lg:w-60 flex-shrink-0">
                      <Link to={`/blog/${blog.slug || blog.id}`} className="block overflow-hidden">
                        <img
                          src={blog.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop'}
                          alt={blog.title}
                          className="w-full h-40 sm:h-36 object-cover hover:opacity-90 transition-opacity duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/600x400/f0f1ff/3333FF?text=Article';
                          }}
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </main>

          {/* SIDEBAR */}
          <aside className="hidden lg:block w-56 flex-shrink-0 pl-10 pt-10">
            <div className="sticky top-8 space-y-8">

              {/* Search */}
              <div>
                <p className="text-xs font-['Inter'] font-bold uppercase tracking-[0.18em] text-black mb-3">Search blogs</p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full px-3 py-2 border border-gray-300 font-['Inter'] text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="border-t border-gray-200" />

              {/* Blog Months */}
              <div>
                <p className="text-xs font-['Inter'] font-bold uppercase tracking-[0.18em] text-black mb-3">Blog Months</p>
                <ul className="space-y-0.5">
                  {months.map(month => (
                    <li key={month}>
                      <button
                        onClick={() => setActiveMonth(month)}
                        className={`w-full text-left text-sm font-['Inter'] py-1.5 px-2 transition-colors ${
                          activeMonth === month
                            ? 'font-bold text-[#3333FF] bg-[#f0f1ff]'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {month}
                        {month !== 'All' && (
                          <span className="ml-1 text-gray-300 text-xs">
                            ({blogs.filter(b => getMonthYear(b.date) === month).length})
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200" />

              <p className="text-xs font-['Inter'] text-gray-400 leading-relaxed">
                Showing <strong className="text-black">{filtered.length}</strong> of{' '}
                <strong className="text-black">{blogs.length}</strong> articles
              </p>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
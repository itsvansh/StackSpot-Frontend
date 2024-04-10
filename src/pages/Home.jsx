import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HomePost from '../components/HomePost';
import Footer from '../components/Footer';
import { Link, useLocation } from 'react-router-dom';
import { useGetAllPostQuery, useGetFollowingPostQuery, useGetSearchPostMutation } from '../api/post';
import Loader from '../components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';

const Home = () => {
    const { data, isLoading, error } = useGetAllPostQuery();
    const dispatch = useDispatch();
    const { search } = useLocation();
    const [searchedPosts, setSearchedPosts] = useState([]);
    const [followingPosts, setFollowingPosts] = useState([]);
    const [allPost, setAllPosts] = useState([]);
    const [activeLink, setActiveLink] = useState('explore');
    const { theme } = useSelector((state) => state.theme);
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const [getSearchPost, { isLoading: searchLoader }] = useGetSearchPostMutation();
    const { data: followingData } = useGetFollowingPostQuery();

    const [activePage, setActivePage] = useState(1);
    const [postLength, setPostLength] = useState(0);



    const fetchMoreFollowing = () => {
        const followingPost = followingData?.followingPost;
        if (followingPost) {
            setActivePage(activePage + 1);
            setFollowingPosts([...followingPosts, ...followingPost]);
            setPostLength(followingPost.length);
        }
    };

    const fetchMorePosts = () => {
        const allPosts = data?.allPost;
        if (allPosts) {
            setActivePage(activePage + 1);
            setAllPosts([...allPost, ...allPosts]);
            setPostLength(allPosts.length);
        }
    };


    useEffect(() => {
        if (followingData) {
            fetchMorePosts();
        } else {
            fetchMorePosts();
        }
    }, [followingData, data?.allPost]);

    useEffect(() => {
        const fetchSearch = async () => {
            try {
                const { data } = await getSearchPost(search);
                if (data && data.searchedPost) {
                    setSearchedPosts(data.searchedPost);
                } else {
                    setSearchedPosts([]);
                }
            } catch (err) {
                toast.error('Something went wrong');
            }
        };

        if (search) {
            fetchSearch();
        } else {
            setSearchedPosts([]);
        }
    }, [search, getSearchPost]);


    return (
        <>
            <Navbar />
            <div className={`px-8 min-h-screen py-8 md:px-[200px] min-h-auto ${theme ? " bg-gradient-to-b from-black to-gray-900 via-black text-white" : ""} `}>
                {!search && (
                    <div className='flex justify-center items-center gap-5 text-xl font-semibold font-sans '>
                        <h1 className={`text-xl  font-semibold cursor-pointer ${activeLink === 'explore' ? 'border-b-2 border-zinc-800  duration-300 ' : ''}`} onClick={() => setActiveLink('explore')}>Explore</h1>
                        <h1 className={`text-xl font-semibold cursor-pointer ${activeLink === 'following' ? 'border-b-2 border-zinc-800  duration-300 ' : ''}`} onClick={() => setActiveLink('following')}>Following</h1>
                    </div>
                )}

                {error && <h1 className='text-2xl font-bold text-center mt-8'>Something went wrong</h1>}

                {userInfo && (
                    <>
                        {!search && <Sidebar />}
                        {searchLoader && <Loader />}
                        {!searchLoader && searchedPosts.length === 0 && search && (
                            <h1 className='font-bold text-xl text-center h-[90vh] mt-8'>No Post Found</h1>
                        )}
                        {activeLink === "following" ? (
                            <InfiniteScroll
                                dataLength={followingPosts?.length || 0}
                                hasMore={followingPosts.length < postLength}
                                next={fetchMoreFollowing}
                                loader={<Loader />}
                                endMessage={
                                    <div className={`text-center mt-5 ${theme ? "text-slate-400" : "text-black"}`}>
                                        Follow more users :)
                                    </div>
                                }
                            >
                                {followingPosts?.map((post) => (
                                    <Link to={`/posts/post/${post._id}`} key={post._id}>
                                        <HomePost post={post} />
                                    </Link>
                                ))}
                            </InfiniteScroll>
                        ) : (
                            <InfiniteScroll
                                dataLength={allPost?.length || 0}
                                hasMore={allPost.length < postLength}
                                loader={<Loader />}
                                endMessage={
                                    <div className={`text-center mt-5 ${theme ? "text-slate-400" : "text-black"}`}>
                                       You seen all post :)
                                    </div>
                                }
                            >
                                {!search && data && data?.allPost.map((post) => (
                                    <Link to={`/posts/post/${post._id}`} key={post._id}>
                                        <HomePost post={post} key={post._id} />
                                    </Link>
                                ))}
                            </InfiniteScroll>
                        )}
                    </>
                )}
                {!userInfo && <h1 className='text-2xl font-bold text-center mt-8'>Login to view posts</h1>}
            </div>
            <Footer />
        </>
    );
};

export default Home;

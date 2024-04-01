import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPostByIdQuery, useUpdatePostMutation, useUploadFileMutation } from '../api/post';
import { toast } from 'react-toastify';
import { IoMdCloseCircle } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import DOMPurify from 'dompurify';import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const EditPost = () => {
  const [category, setCategory] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();




  const [uploadFile] = useUploadFileMutation();
  const [updatePost] = useUpdatePostMutation();

  const { data, isLoading } = useGetPostByIdQuery(id);
  const { userInfo } = useSelector((state) => state.auth);

  const getPost = async () => {
    if (data) {
      setTitle(data?.getPost?.title);
      setDescription(data?.getPost?.description);
      setCategoryList(data?.getPost?.categories);
    }
  };

  const handleEditorChange = (content) => {
    setDescription(content);
  };

  useEffect(() => {
    getPost();
  }, [data]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const post = {
        title,
        description: description,
        username: userInfo?.user?.username,
        userId: userInfo?.user?._id,
        categories: categoryList,
      };

      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await uploadFile(formData).unwrap();
        post.photo = res?.img?.filename;
      }

      const updatedData = await updatePost({ updateData: post, postId: id }).unwrap();
      navigate("/posts/post/" + updatedData?.updatePost?._id);
      toast.success("Post updated successfully");
      window.location.reload();
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const addCategory = () => {
    if (category.trim() !== '') {
      setCategoryList([...categoryList, category]);
      setCategory('');
    }
  };

  const deleteCategory = (index) => {
    const updatedCategories = [...categoryList];
    updatedCategories.splice(index, 1);
    setCategoryList(updatedCategories);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-[200px] mt-14">
        <h1 className="font-bold md:text-2xl text-xl mt-8">Update Post</h1>
        <form className="w-full flex flex-col space-y-4 md:space-y-8 mt-4" onSubmit={submitHandler}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="bg-zinc-50 outline-none px-4 py-2 rounded-md" placeholder="Enter post title..." />
          <ReactQuill value={description}  onChange={handleEditorChange} className="bg-zinc-50 w-full  outline-none px-4 py-2 rounded-md" placeholder="Write description..." />
          {file ? (
            <div>
              <p className='font-semibold text-md'>File Name:{file.name}</p>
              <img src={URL.createObjectURL(file)} alt="Uploaded File" width={500} className="mt-2 object-cover rounded-lg" />
            </div>
          ) : (
            <div className="relative top-5 bottom-5 border-2 border-dashed border-gray-300 rounded-lg p-8 flex justify-center items-center cursor-pointer">
              <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => setFile(e.target.files[0])} />
              <div className="text-center">
                <p className="text-gray-500">Drag & Drop or Click to Upload</p>
                <p className="text-sm text-gray-500">(Max file size: 10MB)</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 md:space-x-8 ">
            <input value={category} onChange={(e) => setCategory(e.target.value)} type="text" name="category" id="category" className="px-4 bg-zinc-100 py-2 outline-none rounded-md" placeholder="Enter category..." />
            <button type="button" onClick={addCategory} className="bg-black text-white px-4 py-2 font-semibold cursor-pointer rounded-md ">
              Add
            </button>
          </div>
          <div className="flex mt-4">
            {categoryList?.map((item) => (
              <div key={item._id} className="flex justify-center w-24 items-center mr-4 p-5 space-x-2 bg-gray-200 py-1 rounded-md">
                <p>{item}</p>
                <p onClick={() => deleteCategory(index)} className="p-1 cursor-pointer" ><IoMdCloseCircle size={18} /></p>
              </div>
            ))}
          </div>
          <button type="submit" className="bg-zinc-900 mx-auto w-full md:w-[30%] py-3 px-4 text-white rounded-md mt-24">Update</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditPost;
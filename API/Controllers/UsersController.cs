using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extentions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{

    [Authorize]
    public class UsersController : BaseApiController
  {
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public IUserRepository _UserRepository { get; }

        public UsersController(IUserRepository userRepository , IMapper mapper,IPhotoService photoService)
    {
            _UserRepository = userRepository;
            this._mapper = mapper;
            this._photoService = photoService;
        }

    [HttpGet]
    public async Task<ActionResult<PagedList<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
    {
            //var users = await _UserRepository.GetUserAsync();
            //var usersToReturn = _mapper.Map<IEnumerable<MemberDto>>(users);

            //return Ok(usersToReturn);

            var currentUser = await _UserRepository.GetUserByUsernameAsync(User.GetUserName());
            userParams.CurrentUserName = currentUser.UserName;

            if(string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = currentUser.Gender == "male" ? "female" : "male";
            }

      var user = await _UserRepository.GetMembersAsync(userParams);
            Response.addPaginationHeader(new PaginationHeader(user.CurrentPage, user.PageSize, user.TotalCount, user.TotalPages));
            return Ok(user);
    }
    
    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
    
      return await _UserRepository.GetMemberByUsernameAsync(username);
      //var usersToReturn = _mapper.Map<MemberDto>(user);
      //return Ok(usersToReturn);

    }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            //var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.GetUserName();

            var user = await _UserRepository.GetUserByUsernameAsync(username);

            if(user == null)
            {
                return NotFound();
            }

            _mapper.Map(memberUpdateDto, user);

            if(await _UserRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest("Failed to update user.");

        }
        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _UserRepository.GetUserByUsernameAsync(User.GetUserName()); 

            if(user == null)
            {
                NotFound();
            }

            var result = await _photoService.AddPhotoAsync(file);

            if (result.Error != null)
            {
                return BadRequest(result.Error.Message);
            }

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            if (user.Photos.Count == 0)
            {
                photo.IsMain= true;
            }

            user.Photos.Add(photo);

            if(await _UserRepository.SaveAllAsync())
            {

                return CreatedAtAction(nameof(GetUser), new {username=user.UserName },
                    _mapper.Map<PhotoDto>(photo));
                    //_mapper.Map<PhotoDto>(photo);
            }
            else
            {
                return BadRequest("Problem adding photo");
            }

            
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _UserRepository.GetUserByUsernameAsync(User.GetUserName());
            
            if(user == null)
            {
                NotFound();
            }

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if(photo == null)
            {
                NotFound();
            }

            if(photo.IsMain)
            {
                return BadRequest("This is already your main photo.");
            }

            var currentMain = user.Photos.FirstOrDefault(x=>x.IsMain);

            if(currentMain != null)
            {
                currentMain.IsMain = false;
                
            }
            photo.IsMain = true;

            if(await _UserRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest("Problem setting main photo.");


        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _UserRepository.GetUserByUsernameAsync(User.GetUserName());

            var photo =  user.Photos.FirstOrDefault(x=>x.Id == photoId);

            if(photo == null)
            {
                return NotFound();
            }

            if (photo.IsMain)
            {
                return BadRequest("You cannot delete your main photo");
            }

            if(photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if(result.Error!= null)
                {
                    return BadRequest(result.Error.Message);
                }
            }

            user.Photos.Remove(photo);
            if(await _UserRepository.SaveAllAsync())
            {
                return Ok();
            }

            return BadRequest("Problem deleting photos.");
        }

    
  }
}
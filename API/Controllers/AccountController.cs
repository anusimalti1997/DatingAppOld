using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
  public class AccountController : BaseApiController
  {
    private readonly DataContext _context;
        private readonly IMapper _mapper;

        public ITokenService _tokenService { get; }

        public AccountController(DataContext context , ITokenService tokenService,IMapper mapper)
        {
            this._context = context;
            _tokenService = tokenService;
            this._mapper = mapper;
        }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerdto)
    {
      if (await userexist(registerdto.UserName)) return BadRequest("already exist!");
      using var hmac = new HMACSHA512();

            var user = _mapper.Map<AppUser>(registerdto);

           
                user.UserName = registerdto.UserName;
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerdto.Password));
                user.PasswordSalt = hmac.Key;
     
      _context.Users.Add(user);
      await _context.SaveChangesAsync();


            return new UserDto
            {
                Username = user.UserName,
                Token=_tokenService.CreateToken(user),
                KnownAs=user.KnownAs
            };
    }

    private async Task<bool> userexist(string username)
    {
      return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
    }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto logindto)
        {
            var user = await _context.Users
                .Include(p=>p.Photos)
                .FirstOrDefaultAsync(x=>x.UserName == logindto.UserName);
            if (user == null) return Unauthorized("Invalid username");

            using var hmac = new HMACSHA512(user.PasswordSalt);

            var password = hmac.ComputeHash(Encoding.UTF8.GetBytes(logindto.Password));

            for(var i=0;i<password.Length;i++)
            {
                if (password[i] != user.PasswordHash[i]) { return Unauthorized("Invalid Password"); }
            }


            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user),
                PhotoUrl=user.Photos.FirstOrDefault(x=>x.IsMain)?.Url,
                KnownAs=user.KnownAs
            };

        }
  }
}
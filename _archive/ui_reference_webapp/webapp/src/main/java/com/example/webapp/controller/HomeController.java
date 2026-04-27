package com.example.webapp.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.webapp.pojo.Student;
import com.example.webapp.repositories.IStudentRepository;
import com.example.webapp.repositories.StudentRepository;

@Controller
public class HomeController {
    public HomeController (){
        super();
    }


    @RequestMapping({"/","/layouts-blank"})
    public String LayoutBlank(){
        return "layouts-blank";
    }
    // pages-account-settings-account
    @RequestMapping({"/","/pages-account-settings-account"})
    public String AccountSetting(){
        return "pages-account-settings-account";
    }

    @RequestMapping({"/","/pages-account"})
    public List<Student> Students(){
        IStudentRepository studentRepository = new StudentRepository() ;
        List<Student> students = studentRepository.getAllStudents(0, 10);
        return students;
    }

}

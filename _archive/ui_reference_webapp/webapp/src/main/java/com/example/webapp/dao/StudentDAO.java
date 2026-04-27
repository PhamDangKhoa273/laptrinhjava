package com.example.webapp.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import com.example.webapp.pojo.*;


public class StudentDAO {
    private Configuration configuration = null;
    private SessionFactory sessionFactory = null;

    public StudentDAO(String configFile) {
        configuration = new Configuration();
        configuration.configure(configFile);
        sessionFactory = configuration.buildSessionFactory();
    }

    public void addStudent(Student student) {
        Session session = null;
       
        try{
            session = sessionFactory.openSession();
            session.beginTransaction();
            session.persist(student);
            session.getTransaction().commit();
            
        }catch(Exception e){
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally{
            if(session != null){
                session.close();
            }
        }
    }
    public void updateStudent(Student student){
        Session session = null;
        try{
            session = sessionFactory.openSession();
            session.beginTransaction();
            session.merge(student);
            session.getTransaction().commit();
        }catch(Exception e){
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally{
            if(session != null){
                session.close();
            }
        }
    }
    public void deleteStudent(Student student){
        Session session = null;
        try{
            session = sessionFactory.openSession();
            session.beginTransaction();
            session.remove(student);
            session.getTransaction().commit();
        }catch(Exception e){
            e.printStackTrace();
            session.getTransaction().rollback();
        }finally{
            if(session != null){
                session.close();
            }
        }
    }
    public Student getStudentById(long id){
        Session session = null;
        try{
            session = sessionFactory.openSession();
            return session.get(Student.class, id);
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            if(session != null){
                session.close();
            }
        }
        return null;
    }
    public List<Student> getAllStudents(int page, int pageSize){
        Session session = null;
        try{
            session = sessionFactory.openSession();
            //pagging 
            org.hibernate.query.Query<Student> query = session.createQuery("from Student", Student.class);
            query.setFirstResult((page - 1) * pageSize);
            query.setMaxResults(pageSize);
            return query.getResultList();

        }catch(Exception e){
            e.printStackTrace();
        }finally{
            if(session != null){
                session.close();
            }
        }
        return null;
    }
   
}

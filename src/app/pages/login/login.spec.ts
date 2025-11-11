import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { LoginComponent } from './login';

// Mock do Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have initial email as empty string', () => {
      expect(component.email).toBe('');
    });

    it('should have initial password as empty string', () => {
      expect(component.password).toBe('');
    });

    it('should have initial isLoading as false', () => {
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Form Submission', () => {
    it('should set isLoading to true when onSubmit is called', () => {
      component.fazerLogin();
      expect(component.isLoading).toBeTrue();
    });

    it('should set isLoading to false after timeout', fakeAsync(() => {
      component.fazerLogin();
      expect(component.isLoading).toBeTrue();
      tick(2000);
      expect(component.isLoading).toBeFalse();  
    }));

    it('should navigate to home after successful login', fakeAsync(() => {
      component.fazerLogin();
      tick(2000);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should not proceed if form is invalid', () => {
      const form = document.createElement('form');
      spyOn(form, 'checkValidity').and.returnValue(false);
      spyOn(form, 'reportValidity');
      
      component.onSubmit({ target: form } as any);
      
      expect(form.reportValidity).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Form Data Binding', () => {
    it('should update email when input changes', () => {
      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      emailInput.nativeElement.value = 'test@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.email).toBe('test@example.com');
    });

    it('should update password when input changes', () => {
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
      passwordInput.nativeElement.value = 'secret123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.password).toBe('secret123');
    });
  });

  describe('Form Validation', () => {
    it('should have required attribute on email input', () => {
      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      expect(emailInput.nativeElement.hasAttribute('required')).toBeTrue();
    });

    it('should have required attribute on password input', () => {
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
      expect(passwordInput.nativeElement.hasAttribute('required')).toBeTrue();
    });

    it('should have minlength attribute on password input', () => {
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
      expect(passwordInput.nativeElement.getAttribute('minlength')).toBe('6');
    });
  });

  describe('Button State', () => {
    it('should disable button when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBeTrue();
    });

    it('should show "Entrando..." text when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.textContent.trim()).toBe('Entrando...');
    });

    it('should show "Entrar" text when isLoading is false', () => {
      component.isLoading = false;
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.textContent.trim()).toBe('Entrar');
    });
  });
});